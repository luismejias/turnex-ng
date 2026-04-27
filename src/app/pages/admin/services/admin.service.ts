import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from 'src/app/shared/auth.service';
import { API_URL, BACKEND_URL } from 'src/app/shared/api.config';
import { AdminCompany, AdminProfile, AdminShift, AdminUser, AdminSpecialty, AdminUserShift } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private _companies = signal<AdminCompany[]>([]);

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken() ?? ''}` });
  }

  private get base(): string {
    return `${API_URL}/admin`;
  }

  // ── Upload ───────────────────────────────────────────────────────────────

  uploadLogo(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post<{ url: string }>(
      `${this.base}/upload`,
      formData,
      { headers: new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken() ?? ''}` }) }
    );
  }

  toAbsoluteUrl(path: string): string {
    return `${BACKEND_URL}${path}`;
  }

  // ── Reads (synchronous from signal) ──────────────────────────────────────

  getCompanies(): AdminCompany[] {
    return this._companies();
  }

  getCompanyById(id: number): AdminCompany | undefined {
    return this._companies().find(c => c.id === id);
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  loadCompanies(): Observable<AdminCompany[]> {
    return this.http
      .get<AdminCompany[]>(`${this.base}/companies`, { headers: this.headers })
      .pipe(tap(list => this._companies.set(list)));
  }

  loadCompany(id: number): Observable<AdminCompany> {
    return this.http
      .get<AdminCompany>(`${this.base}/companies/${id}`, { headers: this.headers })
      .pipe(tap(c => {
        const exists = this._companies().some(x => x.id === c.id);
        this._companies.update(list => exists ? list.map(x => x.id === c.id ? c : x) : [...list, c]);
      }));
  }

  // ── Company mutations ─────────────────────────────────────────────────────

  createCompany(data: Omit<AdminCompany, 'id' | 'profiles' | 'shifts' | 'users' | 'specialties'>): Observable<AdminCompany> {
    return this.http
      .post<AdminCompany>(`${this.base}/companies`, data, { headers: this.headers })
      .pipe(tap(c => this._companies.update(list => [...list, { ...c, profiles: [], shifts: [], users: [], specialties: [] }])));
  }

  updateCompany(id: number, data: Partial<Omit<AdminCompany, 'profiles' | 'shifts'>>): Observable<AdminCompany> {
    return this.http
      .patch<AdminCompany>(`${this.base}/companies/${id}`, data, { headers: this.headers })
      .pipe(tap(c => this._companies.update(list => list.map(x => x.id === id ? { ...x, ...c } : x))));
  }

  deleteCompany(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/companies/${id}`, { headers: this.headers })
      .pipe(tap(() => this._companies.update(list => list.filter(c => c.id !== id))));
  }

  // ── Profile mutations ─────────────────────────────────────────────────────

  addProfile(companyId: number, profile: Omit<AdminProfile, 'id'>): Observable<AdminProfile> {
    return this.http
      .post<AdminProfile>(`${this.base}/companies/${companyId}/profiles`, profile, { headers: this.headers })
      .pipe(tap(p => this._companies.update(list =>
        list.map(c => c.id === companyId ? { ...c, profiles: [...c.profiles, p] } : c)
      )));
  }

  updateProfile(companyId: number, profileId: number, data: Partial<AdminProfile>): Observable<AdminProfile> {
    return this.http
      .patch<AdminProfile>(`${this.base}/companies/${companyId}/profiles/${profileId}`, data, { headers: this.headers })
      .pipe(tap(p => this._companies.update(list =>
        list.map(c => c.id === companyId
          ? { ...c, profiles: c.profiles.map(x => x.id === profileId ? { ...x, ...p } : x) }
          : c)
      )));
  }

  deleteProfile(companyId: number, profileId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/companies/${companyId}/profiles/${profileId}`, { headers: this.headers })
      .pipe(tap(() => this._companies.update(list =>
        list.map(c => c.id === companyId
          ? { ...c, profiles: c.profiles.filter(p => p.id !== profileId) }
          : c)
      )));
  }

  // ── Schedule/Shift mutations ──────────────────────────────────────────────

  addShift(companyId: number, shift: Omit<AdminShift, 'id'>): Observable<AdminShift> {
    return this.http
      .post<AdminShift>(`${this.base}/companies/${companyId}/schedules`, shift, { headers: this.headers })
      .pipe(tap(s => this._companies.update(list =>
        list.map(c => c.id === companyId ? { ...c, shifts: [...c.shifts, s] } : c)
      )));
  }

  updateShift(companyId: number, shiftId: number, data: Partial<AdminShift>): Observable<AdminShift> {
    return this.http
      .patch<AdminShift>(`${this.base}/companies/${companyId}/schedules/${shiftId}`, data, { headers: this.headers })
      .pipe(tap(s => this._companies.update(list =>
        list.map(c => c.id === companyId
          ? { ...c, shifts: c.shifts.map(x => x.id === shiftId ? { ...x, ...s } : x) }
          : c)
      )));
  }

  deleteShift(companyId: number, shiftId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/companies/${companyId}/schedules/${shiftId}`, { headers: this.headers })
      .pipe(tap(() => this._companies.update(list =>
        list.map(c => c.id === companyId
          ? { ...c, shifts: c.shifts.filter(s => s.id !== shiftId) }
          : c)
      )));
  }

  // ── User mutations ────────────────────────────────────────────────────────

  loadUsers(companyId: number): Observable<AdminUser[]> {
    return this.http
      .get<AdminUser[]>(`${this.base}/companies/${companyId}/users`, { headers: this.headers })
      .pipe(tap(users => this._companies.update(list =>
        list.map(c => c.id === companyId ? { ...c, users } : c)
      )));
  }

  addUser(companyId: number, data: Omit<AdminUser, 'id' | 'companyId' | 'createdAt'>  & { password: string }): Observable<AdminUser> {
    return this.http
      .post<AdminUser>(`${this.base}/companies/${companyId}/users`, data, { headers: this.headers })
      .pipe(tap(u => this._companies.update(list =>
        list.map(c => c.id === companyId ? { ...c, users: [...(c.users ?? []), u] } : c)
      )));
  }

  updateUser(companyId: number, userId: number, data: Partial<AdminUser>): Observable<AdminUser> {
    return this.http
      .patch<AdminUser>(`${this.base}/companies/${companyId}/users/${userId}`, data, { headers: this.headers })
      .pipe(tap(u => this._companies.update(list =>
        list.map(c => c.id === companyId
          ? { ...c, users: c.users.map(x => x.id === userId ? { ...x, ...u } : x) }
          : c)
      )));
  }

  // ── Specialty mutations ───────────────────────────────────────────────────

  loadSpecialties(companyId: number): Observable<AdminSpecialty[]> {
    return this.http
      .get<AdminSpecialty[]>(`${this.base}/companies/${companyId}/specialties`, { headers: this.headers })
      .pipe(tap(specialties => this._companies.update(list =>
        list.map(c => c.id === companyId ? { ...c, specialties } : c)
      )));
  }

  addSpecialty(companyId: number, data: Omit<AdminSpecialty, 'id' | 'companyId'>): Observable<AdminSpecialty> {
    return this.http
      .post<AdminSpecialty>(`${this.base}/companies/${companyId}/specialties`, data, { headers: this.headers })
      .pipe(tap(s => this._companies.update(list =>
        list.map(c => c.id === companyId ? { ...c, specialties: [...(c.specialties ?? []), s] } : c)
      )));
  }

  updateSpecialty(companyId: number, specialtyId: number, data: Partial<AdminSpecialty>): Observable<AdminSpecialty> {
    return this.http
      .patch<AdminSpecialty>(`${this.base}/companies/${companyId}/specialties/${specialtyId}`, data, { headers: this.headers })
      .pipe(tap(s => this._companies.update(list =>
        list.map(c => c.id === companyId
          ? { ...c, specialties: c.specialties.map(x => x.id === specialtyId ? { ...x, ...s } : x) }
          : c)
      )));
  }

  deleteSpecialty(companyId: number, specialtyId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/companies/${companyId}/specialties/${specialtyId}`, { headers: this.headers })
      .pipe(tap(() => this._companies.update(list =>
        list.map(c => c.id === companyId
          ? { ...c, specialties: c.specialties.filter(s => s.id !== specialtyId) }
          : c)
      )));
  }

  getUserShifts(companyId: number, userId: number): Observable<AdminUserShift[]> {
    return this.http.get<AdminUserShift[]>(
      `${this.base}/companies/${companyId}/users/${userId}/shifts`, { headers: this.headers }
    );
  }

  cancelUserShift(companyId: number, shiftId: number): Observable<AdminUserShift> {
    return this.http.patch<AdminUserShift>(
      `${this.base}/companies/${companyId}/shifts/${shiftId}/cancel`, {}, { headers: this.headers }
    );
  }

  rescheduleUserShift(companyId: number, shiftId: number, date: string, time: string): Observable<AdminUserShift> {
    return this.http.post<AdminUserShift>(
      `${this.base}/companies/${companyId}/shifts/${shiftId}/reschedule`,
      { date, time }, { headers: this.headers }
    );
  }

  deleteUser(companyId: number, userId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/companies/${companyId}/users/${userId}`, { headers: this.headers })
      .pipe(tap(() => this._companies.update(list =>
        list.map(c => c.id === companyId
          ? { ...c, users: c.users.filter(u => u.id !== userId) }
          : c)
      )));
  }
}
