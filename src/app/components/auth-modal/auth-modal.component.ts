import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-card">
        <button class="close-btn" type="button" (click)="closeModal()" aria-label="Cerrar">&times;</button>
        
        <div class="auth-header">
          <div class="auth-logo-badge">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <h3>{{ mode === 'login' ? '¡Bienvenido de nuevo!' : 'Crea tu Cuenta de Cliente' }}</h3>
          <p class="auth-sub">Accede para pedir tus leños rellenos favoritos</p>
        </div>

        <div class="auth-tabs">
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="mode === 'login'"
            (click)="switchMode('login')">
            Iniciar Sesión
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="mode === 'register'"
            (click)="switchMode('register')">
            Registrarse
          </button>
        </div>

        @if (errorMessage) {
          <div class="error-banner" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" style="flex-shrink: 0;">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        }

        <!-- FORMULARIO DE LOGIN -->
        @if (mode === 'login') {
          <form [formGroup]="loginForm" (ngSubmit)="onLoginSubmit()" class="auth-form">
            <div class="form-group">
              <label for="login-email">Correo Electrónico *</label>
              <input id="login-email" type="email" formControlName="email" placeholder="ejemplo@correo.com" />
              @if (loginForm.get('email')?.touched && loginForm.get('email')?.invalid) {
                <span class="field-error">Ingresa un correo válido</span>
              }
            </div>

            <div class="form-group">
              <label for="login-password">Contraseña *</label>
              <div class="password-input-wrapper">
                <input 
                  id="login-password" 
                  [type]="showLoginPassword ? 'text' : 'password'" 
                  formControlName="password" 
                  placeholder="••••••••" />
                <button 
                  type="button" 
                  class="eye-toggle-btn" 
                  (click)="showLoginPassword = !showLoginPassword" 
                  [title]="showLoginPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                  @if (showLoginPassword) {
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
              @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
                <span class="field-error">La contraseña es requerida</span>
              }
            </div>

            <button type="submit" class="submit-btn" [disabled]="isSubmitting">
              {{ isSubmitting ? 'Iniciando sesión...' : 'Ingresar a mi Cuenta' }}
            </button>
          </form>
        }

        <!-- FORMULARIO DE REGISTRO -->
        @if (mode === 'register') {
          <form [formGroup]="registerForm" (ngSubmit)="onRegisterSubmit()" class="auth-form">
            <div class="form-group">
              <label for="reg-nombre">Nombre Completo *</label>
              <input id="reg-nombre" type="text" formControlName="nombre" placeholder="Carlos Palma" />
              @if (registerForm.get('nombre')?.touched && registerForm.get('nombre')?.invalid) {
                <span class="field-error">El nombre es requerido</span>
              }
            </div>

            <div class="form-group">
              <label for="reg-email">Correo Electrónico *</label>
              <input id="reg-email" type="email" formControlName="email" placeholder="ejemplo@correo.com" />
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.invalid) {
                <span class="field-error">Ingresa un correo electrónico válido</span>
              }
            </div>

            <div class="form-group">
              <label for="reg-password">Contraseña *</label>
              <div class="password-input-wrapper">
                <input 
                  id="reg-password" 
                  [type]="showRegisterPassword ? 'text' : 'password'" 
                  formControlName="password" 
                  placeholder="Mínimo 6 caracteres" />
                <button 
                  type="button" 
                  class="eye-toggle-btn" 
                  (click)="showRegisterPassword = !showRegisterPassword" 
                  [title]="showRegisterPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                  @if (showRegisterPassword) {
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
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.invalid) {
                <span class="field-error">La contraseña debe tener al menos 6 caracteres</span>
              }
            </div>

            <div class="form-group">
              <label for="reg-telefono">Teléfono *</label>
              <input id="reg-telefono" type="tel" formControlName="telefono" placeholder="5512345678" />
              @if (registerForm.get('telefono')?.touched && registerForm.get('telefono')?.invalid) {
                <span class="field-error">Ingresa un teléfono válido de 10 dígitos</span>
              }
            </div>

            <div class="form-group">
              <label for="reg-ubicacion">Dirección de Entrega</label>
              <input id="reg-ubicacion" type="text" formControlName="ubicacion" placeholder="Calle Hidalgo #123, Col. Centro" />
            </div>

            <div class="form-group privacy-checkbox-group" style="margin-top: 4px;">
              <label class="checkbox-label" style="display: flex; align-items: flex-start; gap: 8px; font-size: 0.82rem; font-weight: 500; color: #4a382d; cursor: pointer;">
                <input type="checkbox" formControlName="aceptaAviso" id="reg-acepta-aviso" style="margin-top: 3px; accent-color: #ea580c; width: 16px; height: 16px; flex-shrink: 0;" />
                <span>
                  Acepto el <button type="button" (click)="onViewPrivacy()" style="background: none; border: none; color: #ea580c; text-decoration: underline; font-weight: 700; cursor: pointer; padding: 0; font-size: inherit;">Aviso de Privacidad</button> y autorizo la transferencia de mis datos a terceros (WhatsApp/Meta, Cloudinary y Proveedor de Nube) conforme a la LGPDPPSO. *
                </span>
              </label>
              @if (registerForm.get('aceptaAviso')?.touched && registerForm.get('aceptaAviso')?.invalid) {
                <span class="field-error">Debes aceptar el Aviso de Privacidad y las transferencias a terceros para completar tu registro.</span>
              }
            </div>

            <button type="submit" class="submit-btn" [disabled]="isSubmitting">
              {{ isSubmitting ? 'Creando cuenta...' : 'Completar Registro' }}
            </button>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(18, 11, 7, 0.78);
      backdrop-filter: blur(10px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
      animation: fadeInOverlay 0.25s ease-out;
    }

    @keyframes fadeInOverlay {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-card {
      background: #ffffff;
      width: 100%;
      max-width: 450px;
      border-radius: 24px;
      padding: 2.25rem 2rem 2rem 2rem;
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      max-height: 90vh;
      overflow-y: auto;
      animation: modalZoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalZoomIn {
      from {
        opacity: 0;
        transform: scale(0.92) translateY(15px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .close-btn {
      position: absolute;
      top: 1.15rem;
      right: 1.25rem;
      background: #f3eae3;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 1.4rem;
      color: #6b5548;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #d96b27;
      color: #ffffff;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 1.25rem;
    }

    .auth-logo-badge {
      width: 52px;
      height: 52px;
      margin: 0 auto 0.75rem auto;
      background: linear-gradient(135deg, #ea580c, #c2410c);
      color: #ffffff;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 18px rgba(234, 88, 12, 0.35);
    }

    .auth-logo-badge svg {
      width: 28px;
      height: 28px;
    }

    .auth-header h3 {
      font-size: 1.3rem;
      color: #3b281c;
      margin-bottom: 0.25rem;
      font-weight: 800;
    }

    .auth-sub {
      font-size: 0.85rem;
      color: #7c685b;
    }

    .auth-tabs {
      display: flex;
      gap: 0.5rem;
      background: #f8f2ed;
      padding: 0.3rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .tab-btn {
      flex: 1;
      padding: 0.65rem;
      background: none;
      border: none;
      font-size: 0.9rem;
      font-weight: 700;
      color: #7c685b;
      cursor: pointer;
      border-radius: 9px;
      transition: all 0.2s ease;
    }

    .tab-btn.active {
      background: #ffffff;
      color: #ea580c;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .error-banner {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      margin-bottom: 1.25rem;
      font-size: 0.88rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-group label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #4a382d;
    }

    .form-group input {
      padding: 0.75rem 1rem;
      border: 1.5px solid #e7dcd3;
      border-radius: 10px;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s;
      background: #faf7f4;
    }

    .form-group input:focus {
      border-color: #ea580c;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.12);
    }

    .field-error {
      font-size: 0.8rem;
      color: #dc2626;
      font-weight: 500;
    }

    .submit-btn {
      margin-top: 0.5rem;
      padding: 0.9rem;
      background: linear-gradient(135deg, #ea580c, #c2410c);
      color: #ffffff;
      font-weight: 800;
      font-size: 1rem;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 6px 16px rgba(234, 88, 12, 0.35);
      transition: transform 0.2s, opacity 0.2s;
    }

    .password-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-input-wrapper input {
      width: 100%;
      padding-right: 2.75rem;
    }

    .eye-toggle-btn {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .eye-toggle-btn:hover {
      color: #ea580c;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .submit-btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
  `]
})
export class AuthModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() requestPrivacyView = new EventEmitter<void>();

  mode: 'login' | 'register' = 'login';
  isSubmitting = false;
  errorMessage = '';
  showLoginPassword = false;
  showRegisterPassword = false;

  loginForm: FormGroup;
  registerForm: FormGroup;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  constructor() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(emailPattern)]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern(emailPattern)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      ubicacion: [''],
      aceptaAviso: [false, Validators.requiredTrue]
    });
  }

  onViewPrivacy(): void {
    this.requestPrivacyView.emit();
  }

  switchMode(newMode: 'login' | 'register'): void {
    this.mode = newMode;
    this.errorMessage = '';
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        const userName = res.usuario?.nombre || res.user?.nombre || res.usuario?.name || res.user?.name || 'Cliente';
        this.toastService.success(`¡Bienvenido de nuevo, ${userName}!`, 'Sesión Iniciada');
        this.loginSuccess.emit();
        this.closeModal();

        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = this.authService.extractErrorMessage(err, 'Correo o contraseña incorrectos. Por favor verifica tus credenciales.');
        this.toastService.error(this.errorMessage, 'Error de Autenticación');
      }
    });
  }

  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formVal = this.registerForm.value;
    const registerPayload = {
      nombre: formVal.nombre,
      email: formVal.email,
      password: formVal.password,
      telefono: formVal.telefono,
      ubicacion: formVal.ubicacion,
      avisoPrivacidadAceptado: true
    };

    this.authService.registro(registerPayload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        const userName = res.usuario?.nombre || 'Cliente';
        this.toastService.success(`¡Tu cuenta ha sido creada exitosamente! Bienvenido, ${userName}.`, 'Registro Exitoso');
        this.loginSuccess.emit();
        this.closeModal();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = this.authService.extractErrorMessage(err, 'Por favor verifica que tus datos sean correctos e inténtalo de nuevo.');
        this.toastService.error(this.errorMessage, 'Error en Registro');
      }
    });
  }
}
