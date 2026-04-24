import { Component, inject, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Location } from '@angular/common';

@Component({
  selector: 'turnex-edit-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss',
})
export class EditProfileComponent implements OnInit {
  @Input() companyId!: string;
  @Input() profileId!: string;

  private adminService = inject(AdminService);
  private router = inject(Router);
  private location = inject(Location);
  private fb = inject(FormBuilder);

  form!: FormGroup;

  ngOnInit(): void {
    const company = this.adminService.getCompanyById(Number(this.companyId));
    const p = company?.profiles.find(p => p.id === Number(this.profileId));
    if (!p) { this.location.back(); return; }

    this.form = this.fb.group({
      type:     [p.type],
      name:     [p.name,     Validators.required],
      lastName: [p.lastName, Validators.required],
      phone:    [p.phone,    Validators.required],
      email:    [p.email,    [Validators.required, Validators.email]],
      password: [''],
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const { password, ...profileData } = this.form.value;
    this.adminService.updateProfile(Number(this.companyId), Number(this.profileId), profileData)
      .subscribe(() => this.router.navigate(['/admin/companies', this.companyId]));
  }

  goBack(): void {
    this.location.back();
  }
}
