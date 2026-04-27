import { Component, inject, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminShift } from '../../models/admin.models';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Location } from '@angular/common';

@Component({
  selector: 'turnex-create-specialty',
  imports: [ReactiveFormsModule],
  templateUrl: './create-specialty.component.html',
  styleUrl: './create-specialty.component.scss',
})
export class CreateSpecialtyComponent implements OnInit {
  @Input() companyId!: string;

  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private location = inject(Location);
  private fb = inject(FormBuilder);

  schedules: AdminShift[] = [];

  form: FormGroup = this.fb.group({
    name:        ['', Validators.required],
    description: [''],
    capacity:    [10, [Validators.required, Validators.min(1)]],
    scheduleId:  [null],
  });

  ngOnInit(): void {
    const company = this.adminService.getCompanyById(Number(this.companyId));
    this.schedules = company?.shifts ?? [];
  }

  save(): void {
    if (this.form.invalid) return;
    const val = this.form.value;
    const data = { ...val, scheduleId: val.scheduleId ? Number(val.scheduleId) : null };
    this.adminService.addSpecialty(Number(this.companyId), data).subscribe({
      next: () => {
        this.toast.show('Especialidad creada correctamente');
        this.router.navigate(['/admin/companies', this.companyId]);
      },
      error: () => this.toast.show('Error al crear la especialidad', 'error'),
    });
  }

  goBack(): void {
    this.toast.show('Operación cancelada', 'info');
    this.location.back();
  }
}
