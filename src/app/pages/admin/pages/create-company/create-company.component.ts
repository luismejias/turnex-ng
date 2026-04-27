import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap, forkJoin } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { AdminProfile, AdminShift } from '../../models/admin.models';
import { Location } from '@angular/common';

type Step = 1 | 2 | 3;

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const PACKS = ['Clase suelta', '4 clases al mes', '8 clases al mes', '12 clases al mes'];
const PERIODICITY = ['Cada 15 minutos', 'Cada 30 minutos', 'Cada 45 minutos', 'Cada 60 minutos'];

@Component({
  selector: 'turnex-create-company',
  imports: [ReactiveFormsModule],
  templateUrl: './create-company.component.html',
  styleUrl: './create-company.component.scss',
})
export class CreateCompanyComponent {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private location = inject(Location);
  private fb = inject(FormBuilder);

  step: Step = 1;
  readonly days = DAYS;
  readonly packs = PACKS;
  readonly periodicity = PERIODICITY;

  selectedDays: string[] = [];
  selectedPacks: string[] = [];
  logoPreview: string | null = null;
  uploading = false;

  companyForm: FormGroup = this.fb.group({
    name:    ['', Validators.required],
    cuit:    ['', Validators.required],
    phone:   ['', Validators.required],
    address: ['', Validators.required],
    service: ['', Validators.required],
    logo:    [''],
  });

  profileForm: FormGroup = this.fb.group({
    type:     ['Administrador'],
    name:     ['', Validators.required],
    lastName: ['', Validators.required],
    phone:    ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: [''],
  });

  shiftForm: FormGroup = this.fb.group({
    name:        ['', Validators.required],
    timeFrom:    ['8:00 hs'],
    timeTo:      ['18:00 hs'],
    periodicity: ['Cada 30 minutos'],
  });

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading = true;
    this.adminService.uploadLogo(file).subscribe({
      next: ({ url }) => {
        this.logoPreview = this.adminService.toAbsoluteUrl(url);
        this.companyForm.patchValue({ logo: url });
        this.uploading = false;
      },
      error: () => { this.uploading = false; },
    });
  }

  get stepLabel(): string {
    return ['Crear empresa', 'Crear perfil', 'Crear turno'][this.step - 1];
  }

  get canFinish(): boolean {
    return this.shiftForm.valid && this.selectedDays.length > 0 && this.selectedPacks.length > 0;
  }

  nextStep(): void {
    if (this.step < 3) this.step = (this.step + 1) as Step;
  }

  prevStep(): void {
    if (this.step > 1) this.step = (this.step - 1) as Step;
    else this.location.back();
  }

  toggleDay(day: string): void {
    const idx = this.selectedDays.indexOf(day);
    if (idx >= 0) this.selectedDays.splice(idx, 1);
    else this.selectedDays.push(day);
  }

  togglePack(pack: string): void {
    const idx = this.selectedPacks.indexOf(pack);
    if (idx >= 0) this.selectedPacks.splice(idx, 1);
    else this.selectedPacks.push(pack);
  }

  finish(): void {
    if (!this.canFinish) return;
    const { password, ...profileFields } = this.profileForm.value;
    const profile: Omit<AdminProfile, 'id'> = { ...profileFields, active: true };
    const shift: Omit<AdminShift, 'id'> = {
      ...this.shiftForm.value,
      days: this.selectedDays,
      packs: this.selectedPacks,
    };

    this.adminService.createCompany(this.companyForm.value).pipe(
      switchMap(newCompany => forkJoin([
        this.adminService.addProfile(newCompany.id, profile),
        this.adminService.addShift(newCompany.id, shift),
      ]))
    ).subscribe(() => this.router.navigate(['/admin/companies']));
  }
}
