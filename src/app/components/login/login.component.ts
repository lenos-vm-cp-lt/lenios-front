import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Componente Standalone de Autenticación de Usuarios.
 * Proporciona el formulario de inicio de sesión de la plataforma.
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
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input 
              id="email" 
              type="email" 
              [(ngModel)]="email" 
              name="email" 
              required 
              placeholder="admin@lenios.com" 
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
              placeholder="••••••••" 
              class="form-control" />
          </div>

          <button type="submit" class="submit-btn">
            Iniciar Sesión
          </button>

          <div class="demo-hint">
            💡 Demostración: Haz clic en "Iniciar Sesión" para generar un JWT de prueba e ingresar al Dashboard.
          </div>
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
    .submit-btn:hover {
      background: var(--color-orange-bright);
      box-shadow: var(--shadow-glow);
    }
    .demo-hint {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      background: var(--color-bg-cream);
      padding: 0.75rem;
      border-radius: var(--radius-sm);
      border-left: 3px solid var(--color-orange-primary);
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

  email = 'admin@lenios.com';
  password = 'password123';

  onLogin(): void {
    // Simular recepción de token JWT del backend
    const mockJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJpYXQiOjE1MTYyMzkwMjJ9.mock_signature';
    
    this.authService.setToken(mockJwtToken);
    this.authService.setUserInfo({
      name: 'Administrador Leños',
      email: this.email,
      role: 'Superadmin'
    });

    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
    this.router.navigateByUrl(returnUrl);
  }
}
