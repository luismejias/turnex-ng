import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from 'src/app/shared/auth.service';
import { API_URL, BACKEND_URL } from 'src/app/shared/api.config';
import { AdminCompany, AdminProfile, AdminShift } from '../models/admin.models';

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

  // ── Company mutations ─────────────────────────────────────────────────────

  createCompany(data: Omit<AdminCompany, 'id' | 'profiles' | 'shifts'>): Observable<AdminCompany> {
    return this.http
      .post<AdminCompany>(`${this.base}/companies`, data, { headers: this.headers })
      .pipe(tap(c => this._companies.update(list => [...list, { ...c, profiles: [], shifts: [] }])));
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
}
