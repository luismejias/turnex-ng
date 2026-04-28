import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from 'src/app/models';
import { API_URL } from './api.config';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Servicio de autenticación.
 * Gestiona el login, registro, sesión JWT y acceso al usuario almacenado en localStorage.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  readonly currentUser = signal<User | null>(this.getStoredUser());

  /**
   * Autentica al usuario con email y contraseña.
   * Al completarse, persiste el token y los datos del usuario en localStorage.
   * @param email - Correo electrónico del usuario.
   * @param password - Contraseña en texto plano.
   * @returns Observable con el token JWT y los datos del usuario.
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, { email, password }).pipe(
      tap((res) => this._storeSession(res))
    );
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * Al completarse, persiste el token y los datos del usuario en localStorage.
   * @param data - Datos del nuevo usuario.
   * @returns Observable con el token JWT y los datos del usuario creado.
   */
  register(data: { name: string; lastName: string; email: string; password: string; termAndConditions: boolean }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/register`, data).pipe(
      tap((res) => this._storeSession(res))
    );
  }

  /**
   * Obtiene los datos actualizados del usuario autenticado desde el backend.
   * @returns Observable con los datos del usuario.
   */
  getMe(): Observable<User> {
    return this.http.get<User>(`${API_URL}/auth/me`);
  }

  /**
   * Refresca el usuario en localStorage consultando el backend.
   * Útil tras acciones que modifican campos del usuario (ej. `firstLogin`).
   */
  refreshUser(): void {
    this.getMe().subscribe({
      next: (user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
      },
      error: (err) => console.error('[AuthService] refreshUser failed:', err),
    });
  }

  /**
   * Cierra la sesión del usuario eliminando el token y los datos del localStorage.
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  /**
   * Retorna el JWT almacenado en localStorage.
   * @returns El token o `null` si no hay sesión activa.
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Retorna el objeto {@link User} almacenado en localStorage.
   * @returns El usuario deserializado o `null` si no hay sesión activa.
   */
  getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  /**
   * Indica si existe un token de sesión válido (no verifica expiración en cliente).
   * @returns `true` si hay un token almacenado.
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Persiste el token y los datos del usuario en localStorage.
   * @param res - Respuesta de autenticación del backend.
   */
  private _storeSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }
}
