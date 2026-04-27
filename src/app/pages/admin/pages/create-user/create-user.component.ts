import { Component, inject, Input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Location } from '@angular/common';

@Component({
  selector: 'turnex-create-user',
  imports: [ReactiveFormsModule],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.scss',
})
export class CreateUserComponent {
  @Input() companyId!: string;

  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private location = inject(Location);
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    name:      ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(6)]],
    role:      ['USER'],
    active:    [true],
  });

  save(): void {
    if (this.form.invalid) return;
    this.adminService.addUser(Number(this.companyId), this.form.value)
      .subscribe({
        next: () => {
          this.toast.show('Usuario creado correctamente');
          this.router.navigate(['/admin/companies', this.companyId]);
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Error al crear el usuario';
          this.toast.show(msg, 'error');
        },
      });
  }

  goBack(): void {
    this.toast.show('Operación cancelada', 'info');
    this.location.back();
  }
}
