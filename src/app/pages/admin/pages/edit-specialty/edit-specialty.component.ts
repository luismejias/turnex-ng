import { Component, inject, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminShift } from '../../models/admin.models';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Location } from '@angular/common';

@Component({
  selector: 'turnex-edit-specialty',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-specialty.component.html',
  styleUrl: './edit-specialty.component.scss',
})
export class EditSpecialtyComponent implements OnInit {
  @Input() companyId!: string;
  @Input() specialtyId!: string;

  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private location = inject(Location);
  private fb = inject(FormBuilder);

  schedules: AdminShift[] = [];
  form!: FormGroup;

  ngOnInit(): void {
    const company = this.adminService.getCompanyById(Number(this.companyId));
    const sp = company?.specialties?.find(s => s.id === Number(this.specialtyId));
    if (!sp) { this.location.back(); return; }

    this.schedules = company?.shifts ?? [];

    this.form = this.fb.group({
      name:        [sp.name,        Validators.required],
      description: [sp.description ?? ''],
      capacity:    [sp.capacity,    [Validators.required, Validators.min(1)]],
      scheduleId:  [sp.scheduleId ?? null],
      active:      [sp.active],
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const val = this.form.value;
    const data = { ...val, scheduleId: val.scheduleId ? Number(val.scheduleId) : null };
    this.adminService.updateSpecialty(Number(this.companyId), Number(this.specialtyId), data).subscribe({
      next: () => {
        this.toast.show('Especialidad actualizada');
        this.router.navigate(['/admin/companies', this.companyId]);
      },
      error: () => this.toast.show('Error al guardar la especialidad', 'error'),
    });
  }

  goBack(): void {
    this.toast.show('Operación cancelada', 'info');
    this.location.back();
  }
}
