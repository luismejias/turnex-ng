import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Location } from '@angular/common';

@Component({
  selector: 'turnex-editar-perfil',
  imports: [FormsModule],
  templateUrl: './editar-perfil.component.html',
  styleUrl: './editar-perfil.component.scss',
})
export class EditarPerfilComponent implements OnInit {
  @Input() companyId!: string;
  @Input() profileId!: string;

  private adminService = inject(AdminService);
  private router = inject(Router);
  private location = inject(Location);

  profile = { type: 'Administrador', name: '', lastName: '', phone: '', email: '', active: true };

  ngOnInit(): void {
    const company = this.adminService.getCompanyById(Number(this.companyId));
    const p = company?.profiles.find(p => p.id === Number(this.profileId));
    if (!p) { this.location.back(); return; }
    this.profile = { type: p.type, name: p.name, lastName: p.lastName, phone: p.phone, email: p.email, active: p.active };
  }

  get canSave(): boolean {
    return !!(this.profile.name && this.profile.lastName && this.profile.phone && this.profile.email);
  }

  save(): void {
    this.adminService.updateProfile(Number(this.companyId), Number(this.profileId), this.profile as any);
    this.router.navigate(['/admin/empresas', this.companyId]);
  }

  goBack(): void {
    this.location.back();
  }
}
