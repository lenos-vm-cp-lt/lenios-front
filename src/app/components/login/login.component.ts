import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Componente Standalone de Autenticación de Usuarios.
 * Proporciona el formulario de inicio de sesión de la plataforma conectado a la API real.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="brand-header">
          <div class="logo">
            <svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30" style="color: var(--color-orange-primary);">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <h1>Leños Rellenos</h1>
          <p>Portal Administrativo</p>
        </div>

        <form (ngSubmit)="onLogin()" class="login-form">
          <div *ngIf="errorMessage" class="error-alert" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input 
              id="email" 
              type="email" 
              [(ngModel)]="email" 
              name="email" 
              required 
              [disabled]="isLoading"
              placeholder="admin@lenosrellenos.com" 
              class="form-control" />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="password-input-wrapper" style="position: relative; display: flex; align-items: center;">
              <input 
                id="password" 
                [type]="showPassword ? 'text' : 'password'" 
                [(ngModel)]="password" 
                name="password" 
                required 
                [disabled]="isLoading"
                placeholder="••••••••" 
                class="form-control" 
                style="width: 100%; padding-right: 2.75rem;" />
              <button 
                type="button" 
                (click)="showPassword = !showPassword" 
                [title]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                style="position: absolute; right: 0.75rem; background: none; border: none; color: #9ca3af; cursor: pointer; padding: 0.25rem; display: flex; align-items: center; justify-content: center;">
                @if (showPassword) {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                }
              </button>
            </div>
          </div>

          <button type="submit" class="submit-btn" [disabled]="isLoading">
            <span *ngIf="!isLoading">Iniciar Sesión</span>
            <span *ngIf="isLoading">Iniciando sesión...</span>
          </button>
        </form>

        <div class="login-footer">
          <a routerLink="/" class="back-link">← Volver al Catálogo Público</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--color-brown-darkest), var(--color-brown-medium));
      padding: 1.5rem;
    }
    .login-card {
      background: var(--color-bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 420px;
      padding: 2.5rem;
    }
    .brand-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .logo {
      font-size: 2.5rem;
      background: var(--color-orange-subtle);
      width: 60px;
      height: 60px;
      margin: 0 auto 0.75rem auto;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--color-orange-primary);
    }
    .brand-header h1 {
      font-size: 1.5rem;
      color: var(--color-brown-darkest);
    }
    .brand-header p {
      color: var(--color-text-muted);
      font-size: 0.9rem;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .error-alert {
      background-color: #FEE2E2;
      border: 1px solid #F87171;
      color: #991B1B;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .error-icon {
      font-size: 1rem;
      flex-shrink: 0;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-brown-dark);
    }
    .form-control {
      padding: 0.75rem 1rem;
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.95rem;
      outline: none;
      transition: var(--transition-fast);
    }
    .form-control:focus {
      border-color: var(--color-orange-primary);
      box-shadow: 0 0 0 3px rgba(232, 97, 0, 0.15);
    }
    .form-control:disabled {
      background-color: var(--color-bg-cream);
      opacity: 0.7;
      cursor: not-allowed;
    }
    .submit-btn {
      padding: 0.85rem;
      background: var(--color-orange-primary);
      color: #FFFFFF;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: var(--transition-fast);
      margin-top: 0.5rem;
    }
    .submit-btn:hover:not(:disabled) {
      background: var(--color-orange-bright);
      box-shadow: var(--shadow-glow);
    }
    .submit-btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    .login-footer {
      margin-top: 1.5rem;
      text-align: center;
    }
    .back-link {
      color: var(--color-brown-medium);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .back-link:hover {
      color: var(--color-orange-primary);
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = 'admin@lenosrellenos.com';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor ingresa tu correo y contraseña.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response?.token) {
          this.authService.setToken(response.token);
        }
        if (response?.usuario) {
          this.authService.setUserInfo(response.usuario);
        } else if (response?.user) {
          this.authService.setUserInfo(response.user);
        }

        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err.error?.error) {
          this.errorMessage = err.error.error;
        } else if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.';
        } else if (err.status === 401 || err.status === 400) {
          this.errorMessage = 'Credenciales incorrectas. Revisa tu correo y contraseña.';
        } else if (err.message) {
          this.errorMessage = err.message;
        } else {
          this.errorMessage = 'Ocurrió un error al intentar iniciar sesión. Inténtalo de nuevo.';
        }
      }
    });
  }
}
