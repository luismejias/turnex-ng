import { Component, inject, Input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Location } from '@angular/common';

@Component({
  selector: 'turnex-create-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './create-profile.component.html',
  styleUrl: './create-profile.component.scss',
})
export class CreateProfileComponent {
  @Input() companyId!: string;

  private adminService = inject(AdminService);
  private router = inject(Router);
  private location = inject(Location);
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    type:     ['Administrador'],
    name:     ['', Validators.required],
    lastName: ['', Validators.required],
    phone:    ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: [''],
  });

  save(): void {
    if (this.form.invalid) return;
    const { password, ...profileData } = this.form.value;
    this.adminService.addProfile(Number(this.companyId), { ...profileData, active: true })
      .subscribe(() => this.router.navigate(['/admin/companies', this.companyId]));
  }

  goBack(): void {
    this.location.back();
  }
}
