import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Location } from '@angular/common';

@Component({
  selector: 'turnex-editar-empresa',
  imports: [FormsModule],
  templateUrl: './editar-empresa.component.html',
  styleUrl: './editar-empresa.component.scss',
})
export class EditarEmpresaComponent implements OnInit {
  @Input() id!: string;

  private adminService = inject(AdminService);
  private router = inject(Router);
  private location = inject(Location);

  company = { name: '', cuit: '', phone: '', address: '', service: '' };

  ngOnInit(): void {
    const c = this.adminService.getCompanyById(Number(this.id));
    if (!c) { this.router.navigate(['/admin']); return; }
    this.company = { name: c.name, cuit: c.cuit, phone: c.phone, address: c.address, service: c.service };
  }

  get canSave(): boolean {
    const c = this.company;
    return !!(c.name && c.cuit && c.phone && c.address && c.service);
  }

  save(): void {
    this.adminService.updateCompany(Number(this.id), this.company);
    this.router.navigate(['/admin/empresas', this.id]);
  }

  goBack(): void {
    this.location.back();
  }
}
