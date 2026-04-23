import { Injectable, signal } from '@angular/core';
import { AdminCompany, AdminProfile, AdminShift } from '../models/admin.models';

const MOCK_COMPANIES: AdminCompany[] = [
  {
    id: 1,
    name: 'OStudio',
    cuit: '21-12345678-9',
    phone: '1122334455',
    address: 'Vuelta de Obligado 1234',
    service: 'Pilates y Osteopatía',
    profiles: [
      {
        id: 1,
        type: 'Administrador',
        name: 'María',
        lastName: 'Vásquez',
        phone: '1122334455',
        email: 'mariavasquez@gmail.com',
        active: true,
      },
    ],
    shifts: [
      {
        id: 1,
        name: 'Pilates',
        days: ['Lunes', 'Miércoles', 'Viernes'],
        timeFrom: '8:00 hs',
        timeTo: '18:00 hs',
        periodicity: 'Cada 30 minutos',
        packs: ['Clase suelta', '4 clases al mes', '8 clases al mes', '12 clases al mes'],
      },
    ],
  },
  {
    id: 2,
    name: 'Yogatime Center',
    cuit: '30-87654321-5',
    phone: '1199887766',
    address: 'Av. Corrientes 2500',
    service: 'Yoga y Meditación',
    profiles: [],
    shifts: [],
  },
  {
    id: 3,
    name: 'Natatorio Urquiza',
    cuit: '20-11223344-1',
    phone: '1155443322',
    address: 'Av. Triunvirato 4500',
    service: 'Natación',
    profiles: [],
    shifts: [],
  },
];

@Injectable({ providedIn: 'root' })
export class AdminService {
  private _companies = signal<AdminCompany[]>(MOCK_COMPANIES);

  getCompanies(): AdminCompany[] {
    return this._companies();
  }

  getCompanyById(id: number): AdminCompany | undefined {
    return this._companies().find(c => c.id === id);
  }

  createCompany(company: Omit<AdminCompany, 'id' | 'profiles' | 'shifts'>): AdminCompany {
    const newId = Math.max(...this._companies().map(c => c.id), 0) + 1;
    const newCompany: AdminCompany = { ...company, id: newId, profiles: [], shifts: [] };
    this._companies.update(list => [...list, newCompany]);
    return newCompany;
  }

  updateCompany(id: number, data: Partial<AdminCompany>): void {
    this._companies.update(list =>
      list.map(c => c.id === id ? { ...c, ...data } : c)
    );
  }

  deleteCompany(id: number): void {
    this._companies.update(list => list.filter(c => c.id !== id));
  }

  addProfile(companyId: number, profile: Omit<AdminProfile, 'id'>): void {
    this._companies.update(list => list.map(c => {
      if (c.id !== companyId) return c;
      const newId = Math.max(...c.profiles.map(p => p.id), 0) + 1;
      return { ...c, profiles: [...c.profiles, { ...profile, id: newId }] };
    }));
  }

  updateProfile(companyId: number, profileId: number, data: Partial<AdminProfile>): void {
    this._companies.update(list => list.map(c => {
      if (c.id !== companyId) return c;
      return { ...c, profiles: c.profiles.map(p => p.id === profileId ? { ...p, ...data } : p) };
    }));
  }

  deleteProfile(companyId: number, profileId: number): void {
    this._companies.update(list => list.map(c => {
      if (c.id !== companyId) return c;
      return { ...c, profiles: c.profiles.filter(p => p.id !== profileId) };
    }));
  }

  addShift(companyId: number, shift: Omit<AdminShift, 'id'>): void {
    this._companies.update(list => list.map(c => {
      if (c.id !== companyId) return c;
      const newId = Math.max(...c.shifts.map(s => s.id), 0) + 1;
      return { ...c, shifts: [...c.shifts, { ...shift, id: newId }] };
    }));
  }

  updateShift(companyId: number, shiftId: number, data: Partial<AdminShift>): void {
    this._companies.update(list => list.map(c => {
      if (c.id !== companyId) return c;
      return { ...c, shifts: c.shifts.map(s => s.id === shiftId ? { ...s, ...data } : s) };
    }));
  }

  deleteShift(companyId: number, shiftId: number): void {
    this._companies.update(list => list.map(c => {
      if (c.id !== companyId) return c;
      return { ...c, shifts: c.shifts.filter(s => s.id !== shiftId) };
    }));
  }
}
