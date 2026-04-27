import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from 'src/app/shared/auth.service';
import { API_URL, BACKEND_URL } from 'src/app/shared/api.config';
import { AdminCompany, AdminProfile, AdminShift, AdminUser, AdminSpecialty, AdminUserShift } from '../models/admin.models';

/**
 * Servicio del panel de administración.
 * Mantiene un caché reactivo de empresas en una señal y sincroniza
 * los cambios con el backend tras cada mutación.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  /** Señal interna que almacena la lista de empresas cargadas. */
  private _companies = signal<AdminCompany[]>([]);

  /** Headers HTTP con el JWT del usuario autenticado. */
  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken() ?? ''}` });
  }

  /** URL base del módulo admin en el backend. */
  private get base(): string {
    return `${API_URL}/admin`;
  }

  // ── Upload ───────────────────────────────────────────────────────────────

  /**
   * Sube el logo de una empresa al servidor.
   * @param file - Archivo de imagen a subir.
   * @returns Observable con la URL relativa del logo guardado.
   */
  uploadLogo(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post<{ url: string }>(
      `${this.base}/upload`,
      formData,
      { headers: new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken() ?? ''}` }) }
    );
  }

  /**
   * Convierte una ruta relativa del servidor en una URL absoluta.
   * @param path - Ruta relativa (ej. `/uploads/logo.png`).
   * @returns URL completa con el origen del backend.
   */
  toAbsoluteUrl(path: string): string {
    return `${BACKEND_URL}${path}`;
  }

  // ── Reads (synchronous from signal) ──────────────────────────────────────

  /**
   * Retorna la lista de empresas almacenada en la señal de caché (lectura síncrona).
   * @returns Array con todas las empresas cargadas.
   */
  getCompanies(): AdminCompany[] {
    return this._companies();
  }

  /**
   * Busca una empresa por ID dentro de la señal de caché (lectura síncrona).
   * @param id - ID de la empresa a buscar.
   * @returns La empresa encontrada o `undefined` si no está en caché.
   */
  getCompanyById(id: number): AdminCompany | undefined {
    return this._companies().find(c => c.id === id);
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  /**
   * Carga todas las empresas desde el backend y las almacena en la señal.
   * Solo disponible para SUPER_ADMIN.
   * @returns Observable con la lista completa de empresas.
   */
  loadCompanies(): Observable<AdminCompany[]> {
    return this.http
      .get<AdminCompany[]>(`${this.base}/companies`, { headers: this.headers })
      .pipe(tap(list => this._companies.set(list)));
  }

  /**
   * Carga una empresa específica desde el backend y la agrega o actualiza en la señal.
   * Usado por ADMIN para cargar su propia empresa o cuando navegan directo a la URL.
   * @param id - ID de la empresa a cargar.
   * @returns Observable con los datos de la empresa.
   */
  loadCompany(id: number): Observable<AdminCompany> {
    return this.http
      .get<AdminCompany>(`${this.base}/companies/${id}`, { headers: this.headers })
      .pipe(tap(c => {
        const exists = this._companies().some(x => x.id === c.id);
        this._companies.update(list => exists ? list.map(x => x.id === c.id ? c : x) : [...list, c]);
      }));
  }

  // ── Company mutations ─────────────────────────────────────────────────────

  /**
   * Crea una nueva empresa en el backend y la agrega a la señal.
   * @param data - Datos de la empresa sin ID ni listas de relaciones.
   * @returns Observable con la empresa creada.
   */
  createCompany(data: Omit<AdminCompany, 'id' | 'profiles' | 'shifts' | 'users' | 'specialties'>): Observable<AdminCompany> {
    return this.http
      .post<AdminCompany>(`${this.base}/companies`, data, { headers: this.headers })
      .pipe(tap(c => this._companies.update(list => [...list, { ...c, profiles: [], shifts: [], users: [], specialties: [] }])));
  }

  /**
   * Actualiza los datos de una empresa existente.
   * @param id - ID de la empresa.
   * @param data - Campos a modificar.
   * @returns Observable con la empresa actualizada.
   */
  updateCompany(id: number, data: Partial<Omit<AdminCompany, 'profiles' | 'shifts'>>): Observable<AdminCompany> {
    return this.http
      .patch<AdminCompany>(`${this.base}/companies/${id}`, data, { headers: this.headers })
      .pipe(tap(c => this._companies.update(list => list.map(x => x.id === id ? { ...x, ...c } : x))));
  }

  /**
   * Elimina una empresa del backend y la remueve de la señal.
   * @param id - ID de la empresa a eliminar.
   * @returns Observable vacío que completa tras la eliminación.
   */
  deleteCompany(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/companies/${id}`, { headers: this.headers })
      .pipe(tap(() => this._companies.update(list => list.filter(c => c.id !== id))));
  }

  // ── Profile mutations ─────────────────────────────────────────────────────

  /**
   * Agrega un perfil de staff a una empresa.
   * @param companyId - ID de la empresa.
   * @param profile - Datos del perfil sin ID.
   * @returns Observable con el perfil creado.
   */
  addProfile(companyId: number, profile: Omit<AdminProfile, 'id'>): Observable<AdminProfile> {
    return this.http
      .post<AdminProfile>(`${this.base}/companies/${companyId}/profiles`, profile, { headers: this.headers })
      .pipe(tap(p => this._companies.update(list =>
        list.map(c => c.id === companyId ? { ...c, profiles: [...c.profiles, p] } : c)
      )));
  }

  /**
   * Actualiza los datos de un perfil de staff.
   * @param companyId - ID de la empresa.
   * @param profileId - ID del perfil.
   * @param data - Campos a modificar.
   * @returns Observable con el perfil actualizado.
   */
  updateProfile(companyId: number, profileId: number, data: Partial<AdminProfile>): Observable<AdminProfile> {
    return this.http
      .patch<AdminProfile>(`${this.base}/companies/${companyId}/profiles/${profileId}`, data, { headers: this.headers })
      .pipe(tap(p => this._companies.update(list =>
        list.map(c => c.id === companyId
          ? { ...c, profiles: c.profiles.map(x => x.id === profileId ? { ...x, ...p } : x) }
          : c)
      )));
  }

  /**
   * Elimina un perfil de staff de una empresa.
   * @param companyId - ID de la empresa.
   * @param profileId - ID del perfil a eliminar.
   * @returns Observable vacío que completa tras la eliminación.
   */
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

  /**
   * Agrega un horario (schedule) a una empresa.
   * @param companyId - ID de la empresa.
   * @param shift - Datos del horario sin ID.
   * @returns Observable con el horario creado.
   */
  addShift(companyId: number, shift: Omit<AdminShift, 'id'>): Observable<AdminShift> {
    return this.http
      .post<AdminShift>(`${this.base}/companies/${companyId}/schedules`, shift, { headers: this.headers })
      .pipe(tap(s => this._companies.update(list =>
        list.map(c => c.id === companyId ? { ...c, shifts: [...c.shifts, s] } : c)
      )));
  }

  /**
   * Actualiza los datos de un horario existente.
   * @param companyId - ID de la empresa.
   * @param shiftId - ID del horario.
   * @param data - Campos a modificar.
   * @returns Observable con el horario actualizado.
   */
  updateShift(companyId: number, shiftId: number, data: Partial<AdminShift>): Observable<AdminShift> {
    return this.http
      .patch<AdminShift>(`${this.base}/companies/${companyId}/schedules/${shiftId}`, data, { headers: this.headers })
      .pipe(tap(s => this._companies.update(list =>
        list.map(c => c.id === companyId
          ? { ...c, shifts: c.shifts.map(x => x.id === shiftId ? { ...x, ...s } : x) }
          : c)
      )));
  }

  /**
   * Elimina un horario de una empresa.
   * @param companyId - ID de la empresa.
   * @param shiftId - ID del horario a eliminar.
   * @returns Observable vacío que completa tras la eliminación.
   */
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

  /**
   * Carga los usuarios de una empresa desde el backend y actualiza la señal.
   * @param companyId - ID de la empresa.
   * @returns Observable con la lista de usuarios de la empresa.
   */
  loadUsers(companyId: number): Observable<AdminUser[]> {
    return this.http
      .get<AdminUser[]>(`${this.base}/companies/${companyId}/users`, { headers: this.headers })
      .pipe(tap(users => this._companies.update(list =>
        list.map(c => c.id === companyId ? { ...c, users } : c)
      )));
  }

  /**
   * Crea un usuario en una empresa.
   * @param companyId - ID de la empresa.
   * @param data - Datos del usuario (sin ID ni companyId); incluye contraseña inicial.
   * @returns Observable con el usuario creado.
   */
  addUser(companyId: number, data: Omit<AdminUser, 'id' | 'companyId' | 'createdAt'> & { password: string }): Observable<AdminUser> {
    return this.http
      .post<AdminUser>(`${this.base}/companies/${companyId}/users`, data, { headers: this.headers })
      .pipe(tap(u => this._companies.update(list =>
        list.map(c => c.id === companyId ? { ...c, users: [...(c.users ?? []), u] } : c)
      )));
  }

  /**
   * Actualiza los datos de un usuario de una empresa.
   * @param companyId - ID de la empresa.
   * @param userId - ID del usuario.
   * @param data - Campos a modificar (ej. `{ active: false }`).
   * @returns Observable con el usuario actualizado.
   */
  updateUser(companyId: number, userId: number, data: Partial<AdminUser>): Observable<AdminUser> {
    return this.http
      .patch<AdminUser>(`${this.base}/companies/${companyId}/users/${userId}`, data, { headers: this.headers })
      .pipe(tap(u => this._companies.update(list =>
        list.map(c => c.id === companyId
          ? { ...c, users: c.users.map(x => x.id === userId ? { ...x, ...u } : x) }
          : c)
      )));
  }

  /**
   * Elimina un usuario de una empresa.
   * @param companyId - ID de la empresa.
   * @param userId - ID del usuario a eliminar.
   * @returns Observable vacío que completa tras la eliminación.
   */
  deleteUser(companyId: number, userId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/companies/${companyId}/users/${userId}`, { headers: this.headers })
      .pipe(tap(() => this._companies.update(list =>
        list.map(c => c.id === companyId
          ? { ...c, users: c.users.filter(u => u.id !== userId) }
          : c)
      )));
  }

  // ── Specialty mutations ───────────────────────────────────────────────────

  /**
   * Carga las especialidades de una empresa desde el backend y actualiza la señal.
   * @param companyId - ID de la empresa.
   * @returns Observable con la lista de especialidades de la empresa.
   */
  loadSpecialties(companyId: number): Observable<AdminSpecialty[]> {
    return this.http
      .get<AdminSpecialty[]>(`${this.base}/companies/${companyId}/specialties`, { headers: this.headers })
      .pipe(tap(specialties => this._companies.update(list =>
        list.map(c => c.id === companyId ? { ...c, specialties } : c)
      )));
  }

  /**
   * Agrega una especialidad a una empresa.
   * @param companyId - ID de la empresa.
   * @param data - Datos de la especialidad sin ID ni companyId.
   * @returns Observable con la especialidad creada.
   */
  addSpecialty(companyId: number, data: Omit<AdminSpecialty, 'id' | 'companyId'>): Observable<AdminSpecialty> {
    return this.http
      .post<AdminSpecialty>(`${this.base}/companies/${companyId}/specialties`, data, { headers: this.headers })
      .pipe(tap(s => this._companies.update(list =>
        list.map(c => c.id === companyId ? { ...c, specialties: [...(c.specialties ?? []), s] } : c)
      )));
  }

  /**
   * Actualiza los datos de una especialidad de empresa.
   * @param companyId - ID de la empresa.
   * @param specialtyId - ID de la especialidad.
   * @param data - Campos a modificar (ej. `{ active: false }`).
   * @returns Observable con la especialidad actualizada.
   */
  updateSpecialty(companyId: number, specialtyId: number, data: Partial<AdminSpecialty>): Observable<AdminSpecialty> {
    return this.http
      .patch<AdminSpecialty>(`${this.base}/companies/${companyId}/specialties/${specialtyId}`, data, { headers: this.headers })
      .pipe(tap(s => this._companies.update(list =>
        list.map(c => c.id === companyId
          ? { ...c, specialties: c.specialties.map(x => x.id === specialtyId ? { ...x, ...s } : x) }
          : c)
      )));
  }

  /**
   * Elimina una especialidad de una empresa.
   * @param companyId - ID de la empresa.
   * @param specialtyId - ID de la especialidad a eliminar.
   * @returns Observable vacío que completa tras la eliminación.
   */
  deleteSpecialty(companyId: number, specialtyId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/companies/${companyId}/specialties/${specialtyId}`, { headers: this.headers })
      .pipe(tap(() => this._companies.update(list =>
        list.map(c => c.id === companyId
          ? { ...c, specialties: c.specialties.filter(s => s.id !== specialtyId) }
          : c)
      )));
  }

  // ── User shift management ─────────────────────────────────────────────────

  /**
   * Obtiene todos los turnos de un usuario específico (vista admin).
   * El backend auto-completa turnos vencidos antes de responder.
   * @param companyId - ID de la empresa.
   * @param userId - ID del usuario.
   * @returns Observable con la lista de turnos del usuario.
   */
  getUserShifts(companyId: number, userId: number): Observable<AdminUserShift[]> {
    return this.http.get<AdminUserShift[]>(
      `${this.base}/companies/${companyId}/users/${userId}/shifts`, { headers: this.headers }
    );
  }

  /**
   * Cancela un turno de un usuario desde el panel de administración.
   * @param companyId - ID de la empresa.
   * @param shiftId - ID del turno a cancelar.
   * @returns Observable con el turno actualizado (status = CANCELED).
   */
  cancelUserShift(companyId: number, shiftId: number): Observable<AdminUserShift> {
    return this.http.patch<AdminUserShift>(
      `${this.base}/companies/${companyId}/shifts/${shiftId}/cancel`, {}, { headers: this.headers }
    );
  }

  /**
   * Reagenda un turno de un usuario a una nueva fecha y hora.
   * El turno original se cancela y se crea uno nuevo.
   * @param companyId - ID de la empresa.
   * @param shiftId - ID del turno original.
   * @param date - Nueva fecha en formato ISO.
   * @param time - Nueva hora en formato HH:MM.
   * @returns Observable con el nuevo turno creado.
   */
  rescheduleUserShift(companyId: number, shiftId: number, date: string, time: string): Observable<AdminUserShift> {
    return this.http.post<AdminUserShift>(
      `${this.base}/companies/${companyId}/shifts/${shiftId}/reschedule`,
      { date, time }, { headers: this.headers }
    );
  }
}
