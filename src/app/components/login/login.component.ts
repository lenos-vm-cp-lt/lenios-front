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
          <div class="logo">🔥</div>
          <h1>Leños Rellenos</h1>
          <p>Portal Administrativo</p>
        </div>

        <form (ngSubmit)="onLogin()" class="login-form">
          <div *ngIf="errorMessage" class="error-alert" role="alert">
            <span class="error-icon">⚠️</span>
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
            <input 
              id="password" 
              type="password" 
              [(ngModel)]="password" 
              name="password" 
              required 
              [disabled]="isLoading"
              placeholder="••••••••" 
              class="form-control" />
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
        if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.';
        } else if (err.error?.error) {
          this.errorMessage = err.error.error;
        } else if (err.status === 401 || err.status === 400) {
          this.errorMessage = 'Credenciales incorrectas. Revisa tu correo y contraseña.';
        } else {
          this.errorMessage = 'Ocurrió un error al intentar iniciar sesión. Inténtalo de nuevo.';
        }
      }
    });
  }
}
