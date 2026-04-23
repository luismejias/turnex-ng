import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Location } from '@angular/common';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const PACKS = ['Clase suelta', '4 clases al mes', '8 clases al mes', '12 clases al mes'];
const PERIODICITY = ['Cada 15 minutos', 'Cada 30 minutos', 'Cada 45 minutos', 'Cada 60 minutos'];

@Component({
  selector: 'turnex-editar-turno',
  imports: [FormsModule],
  templateUrl: './editar-turno.component.html',
  styleUrl: './editar-turno.component.scss',
})
export class EditarTurnoComponent implements OnInit {
  @Input() companyId!: string;
  @Input() shiftId!: string;

  private adminService = inject(AdminService);
  private router = inject(Router);
  private location = inject(Location);

  readonly days = DAYS;
  readonly packs = PACKS;
  readonly periodicity = PERIODICITY;

  shift = { name: '', days: [] as string[], timeFrom: '8:00 hs', timeTo: '18:00 hs', periodicity: 'Cada 30 minutos', packs: [] as string[] };

  ngOnInit(): void {
    const company = this.adminService.getCompanyById(Number(this.companyId));
    const s = company?.shifts.find(s => s.id === Number(this.shiftId));
    if (!s) { this.location.back(); return; }
    this.shift = { name: s.name, days: [...s.days], timeFrom: s.timeFrom, timeTo: s.timeTo, periodicity: s.periodicity, packs: [...s.packs] };
  }

  get canSave(): boolean {
    return !!(this.shift.name && this.shift.days.length > 0 && this.shift.packs.length > 0);
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

  save(): void {
    this.adminService.updateShift(Number(this.companyId), Number(this.shiftId), this.shift);
    this.router.navigate(['/admin/empresas', this.companyId]);
  }

  goBack(): void {
    this.location.back();
  }
}
