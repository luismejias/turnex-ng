import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminCompany, AdminProfile, AdminShift } from '../../models/admin.models';
import { Location } from '@angular/common';

type Step = 1 | 2 | 3;

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const PACKS = ['Clase suelta', '4 clases al mes', '8 clases al mes', '12 clases al mes'];
const PERIODICITY = ['Cada 15 minutos', 'Cada 30 minutos', 'Cada 45 minutos', 'Cada 60 minutos'];

@Component({
  selector: 'turnex-crear-empresa',
  imports: [FormsModule],
  templateUrl: './crear-empresa.component.html',
  styleUrl: './crear-empresa.component.scss',
})
export class CrearEmpresaComponent {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private location = inject(Location);

  step: Step = 1;
  readonly days = DAYS;
  readonly packs = PACKS;
  readonly periodicity = PERIODICITY;

  company = { name: '', cuit: '', phone: '', address: '', service: '' };
  profile: Omit<AdminProfile, 'id'> = {
    type: 'Administrador', name: '', lastName: '', phone: '', email: '', active: true,
  };
  shift: Omit<AdminShift, 'id'> = {
    name: '', days: [], timeFrom: '8:00 hs', timeTo: '18:00 hs',
    periodicity: 'Cada 30 minutos', packs: [],
  };

  get stepLabel(): string {
    return ['Crear empresa', 'Crear perfil', 'Crear turno'][this.step - 1];
  }

  get canNextStep1(): boolean {
    const c = this.company;
    return !!(c.name && c.cuit && c.phone && c.address && c.service);
  }

  get canNextStep2(): boolean {
    const p = this.profile;
    return !!(p.name && p.lastName && p.phone && p.email);
  }

  get canFinish(): boolean {
    return !!(this.shift.name && this.shift.days.length > 0 && this.shift.packs.length > 0);
  }

  nextStep(): void {
    if (this.step < 3) this.step = (this.step + 1) as Step;
  }

  prevStep(): void {
    if (this.step > 1) this.step = (this.step - 1) as Step;
    else this.location.back();
  }

  toggleDay(day: string): void {
    const idx = this.shift.days.indexOf(day);
    if (idx >= 0) this.shift.days.splice(idx, 1);
    else this.shift.days.push(day);
  }

  togglePack(pack: string): void {
    const idx = this.shift.packs.indexOf(pack);
    if (idx >= 0) this.shift.packs.splice(idx, 1);
    else this.shift.packs.push(pack);
  }

  finish(): void {
    const newCompany = this.adminService.createCompany(this.company);
    this.adminService.addProfile(newCompany.id, this.profile);
    this.adminService.addShift(newCompany.id, this.shift);
    this.router.navigate(['/admin']);
  }
}
