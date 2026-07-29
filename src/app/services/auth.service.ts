import { Injectable } from '@angular/core';

/**
 * Servicio de Autenticación responsable de gestionar el estado de sesión del usuario
 * y el almacenamiento seguro del token JWT en localStorage.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'lenios_jwt_token';
  private readonly USER_KEY = 'lenios_user_info';

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
  setUserInfo(user: { email: string; name: string; role: string }): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Retorna la información guardada del usuario autenticado.
   */
  getUserInfo(): { email: string; name: string; role: string } | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}
