import { Component, inject, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Location } from '@angular/common';

@Component({
  selector: 'turnex-edit-company',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-company.component.html',
  styleUrl: './edit-company.component.scss',
})
export class EditCompanyComponent implements OnInit {
  @Input() id!: string;

  private adminService = inject(AdminService);
  private router = inject(Router);
  private location = inject(Location);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  logoPreview: string | null = null;
  uploading = false;

  ngOnInit(): void {
    const c = this.adminService.getCompanyById(Number(this.id));
    if (!c) { this.router.navigate(['/admin']); return; }

    this.logoPreview = c.logo ? this.adminService.toAbsoluteUrl(c.logo) : null;

    this.form = this.fb.group({
      name:    [c.name,    Validators.required],
      cuit:    [c.cuit,    Validators.required],
      phone:   [c.phone,   Validators.required],
      address: [c.address, Validators.required],
      service: [c.service, Validators.required],
      logo:    [c.logo ?? ''],
    });
  }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading = true;
    this.adminService.uploadLogo(file).subscribe({
      next: ({ url }) => {
        this.logoPreview = this.adminService.toAbsoluteUrl(url);
        this.form.patchValue({ logo: url });
        this.uploading = false;
      },
      error: () => { this.uploading = false; },
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.adminService.updateCompany(Number(this.id), this.form.value)
      .subscribe(() => this.router.navigate(['/admin/companies', this.id]));
  }

  goBack(): void {
    this.location.back();
  }
}
