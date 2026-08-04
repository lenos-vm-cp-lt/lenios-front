import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface AuthResponseData {
  token: string;
  usuario?: any;
  user?: any;
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
  private readonly API_URL = 'http://localhost:3000/api/v1';
  private readonly TOKEN_KEY = 'lenios_jwt_token';
  private readonly USER_KEY = 'lenios_user_info';

  /**
   * Realiza una petición HTTP POST al backend para iniciar sesión.
   * Evalúa response.success y retorna únicamente la propiedad response.data.
   * @param email Correo electrónico del usuario
   * @param password Contraseña del usuario
   * @returns Observable con los datos de negocio autenticados (token y datos del usuario)
   */
  login(email: string, password: string): Observable<AuthResponseData> {
    return this.http.post<ApiResponse<AuthResponseData>>(`${this.API_URL}/auth/login`, { email, password }).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        throw new Error(response?.message || 'Falló el inicio de sesión.');
      })
    );
  }

  /**
   * Obtiene el token JWT guardado en localStorage.
   * @returns El token JWT como string o null si no existe.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Guarda un token JWT en localStorage.
   * @param token Token JWT recibido tras iniciar sesión.
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Determina si el usuario actual posee un token JWT válido.
   * @returns boolean Verdadero si existe un token no vacío.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && token.trim().length > 0;
  }

  /**
   * Elimina las credenciales guardadas y cierra la sesión del usuario.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Almacena información básica del usuario autenticado.
   */
  setUserInfo(user: any): void {
    const formattedUser = {
      ...user,
      name: user.name || user.nombre || 'Usuario',
      role: user.role || user.rol || 'Usuario'
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(formattedUser));
  }

  /**
   * Retorna la información guardada del usuario autenticado.
   */
  getUserInfo(): any {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}
