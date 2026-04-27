import { Component, inject, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Location } from '@angular/common';

@Component({
  selector: 'turnex-edit-user',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
})
export class EditUserComponent implements OnInit {
  @Input() companyId!: string;
  @Input() userId!: string;

  private adminService = inject(AdminService);
  private router = inject(Router);
  private location = inject(Location);
  private fb = inject(FormBuilder);

  form!: FormGroup;

  ngOnInit(): void {
    const company = this.adminService.getCompanyById(Number(this.companyId));
    const u = company?.users?.find(u => u.id === Number(this.userId));
    if (!u) { this.location.back(); return; }

    this.form = this.fb.group({
      name:     [u.name,     Validators.required],
      lastName: [u.lastName, Validators.required],
      email:    [u.email,    [Validators.required, Validators.email]],
      role:     [u.role],
      active:   [u.active],
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.adminService.updateUser(Number(this.companyId), Number(this.userId), this.form.value)
      .subscribe(() => this.router.navigate(['/admin/companies', this.companyId]));
  }

  goBack(): void { this.location.back(); }
}
