import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  telefono?: string;
  ubicacion?: string;
  avisoPrivacidadAceptado?: boolean;
  fechaAceptacionAviso?: string | Date | null;
}

export interface AuthResponseData {
  token: string;
  usuario?: any;
  user?: any;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  ubicacion?: string;
  avisoPrivacidadAceptado?: boolean;
}

/**
 * Servicio de Autenticación responsable de gestionar el estado de sesión del usuario,
 * realizar peticiones HTTP al backend real y el almacenamiento seguro del token JWT en localStorage.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'lenios_jwt_token';
  private readonly USER_KEY = 'lenios_user_info';

  /**
   * Realiza una petición HTTP POST al backend para iniciar sesión.
   * @param email Correo electrónico del usuario
   * @param password Contraseña del usuario
   * @returns Observable con los datos de negocio autenticados
   */
  login(email: string, password: string): Observable<AuthResponseData> {
    return this.http.post<ApiResponse<AuthResponseData>>(`${this.API_URL}/auth/login`, { email, password }).pipe(
      map(response => {
        if (response && response.success) {
          const data = response.data;
          this.setToken(data.token);
          const userData = data.usuario || data.user;
          if (userData) {
            this.setUserInfo(userData);
          }
          return data;
        }
        throw new Error(response?.message || 'Falló el inicio de sesión.');
      })
    );
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * @param payload Datos del registro de usuario
   */
  registro(payload: RegisterPayload): Observable<AuthResponseData> {
    return this.http.post<ApiResponse<AuthResponseData>>(`${this.API_URL}/auth/registro`, payload).pipe(
      map(response => {
        if (response && response.success) {
          const data = response.data;
          this.setToken(data.token);
          const userData = data.usuario || data.user;
          if (userData) {
            this.setUserInfo(userData);
          }
          return data;
        }
        throw new Error(response?.message || 'Falló el registro de usuario.');
      })
    );
  }

  /**
   * Registra la aceptación del aviso de privacidad en el backend.
   */
  aceptarAvisoPrivacidad(): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/auth/aceptar-aviso`, {}).pipe(
      map(response => {
        if (response && response.success) {
          this.updatePrivacyStatus(true);
          return response.data;
        }
        throw new Error(response?.message || 'No se pudo registrar la aceptación del aviso.');
      })
    );
  }

  /**
   * Obtiene la información actualizada del perfil del usuario autenticado.
   */
  getPerfil(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/auth/me`).pipe(
      tap(response => {
        if (response && response.success && response.data?.usuario) {
          this.setUserInfo(response.data.usuario);
        }
      })
    );
  }

  /**
   * Obtiene el token JWT guardado en localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Guarda un token JWT en localStorage.
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Determina si el usuario actual posee un token JWT válido.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && token.trim().length > 0;
  }

  /**
   * Comprueba si el usuario ha aceptado previamente el Aviso de Privacidad.
   */
  hasAcceptedPrivacy(): boolean {
    const user = this.getUserInfo();
    return !!user && user.avisoPrivacidadAceptado === true;
  }

  /**
   * Actualiza únicamente el estado de aceptación del Aviso de Privacidad en el almacenamiento local.
   */
  updatePrivacyStatus(accepted: boolean): void {
    const user = this.getUserInfo();
    if (user) {
      user.avisoPrivacidadAceptado = accepted;
      if (accepted) {
        user.fechaAceptacionAviso = new Date().toISOString();
      }
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Elimina las credenciales guardadas y cierra la sesión del usuario.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Almacena información del usuario autenticado en localStorage.
   */
  setUserInfo(user: any): void {
    const formattedUser: UserInfo = {
      id: user.id || user._id,
      email: user.email,
      name: user.name || user.nombre || 'Usuario',
      role: user.role || user.rol || 'Cliente',
      telefono: user.telefono || user.phone || '',
      ubicacion: user.ubicacion || user.direccion || user.address || '',
      avisoPrivacidadAceptado: !!user.avisoPrivacidadAceptado,
      fechaAceptacionAviso: user.fechaAceptacionAviso || null
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(formattedUser));
  }

  /**
   * Retorna la información guardada del usuario autenticado.
   */
  getUserInfo(): UserInfo | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}
