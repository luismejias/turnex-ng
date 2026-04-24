import { Component, inject, Input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Location } from '@angular/common';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const PACKS = ['Clase suelta', '4 clases al mes', '8 clases al mes', '12 clases al mes'];
const PERIODICITY = ['Cada 15 minutos', 'Cada 30 minutos', 'Cada 45 minutos', 'Cada 60 minutos'];

@Component({
  selector: 'turnex-create-schedule',
  imports: [ReactiveFormsModule],
  templateUrl: './create-schedule.component.html',
  styleUrl: './create-schedule.component.scss',
})
export class CreateScheduleComponent {
  @Input() companyId!: string;

  private adminService = inject(AdminService);
  private router = inject(Router);
  private location = inject(Location);
  private fb = inject(FormBuilder);

  readonly days = DAYS;
  readonly packs = PACKS;
  readonly periodicity = PERIODICITY;

  selectedDays: string[] = [];
  selectedPacks: string[] = [];

  form: FormGroup = this.fb.group({
    name:        ['', Validators.required],
    timeFrom:    ['8:00 hs'],
    timeTo:      ['18:00 hs'],
    periodicity: ['Cada 30 minutos'],
  });

  get canSave(): boolean {
    return this.form.valid && this.selectedDays.length > 0 && this.selectedPacks.length > 0;
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

  save(): void {
    if (!this.canSave) return;
    this.adminService.addShift(Number(this.companyId), {
      ...this.form.value,
      days: this.selectedDays,
      packs: this.selectedPacks,
    }).subscribe(() => this.router.navigate(['/admin/companies', this.companyId]));
  }

  goBack(): void {
    this.location.back();
  }
}
