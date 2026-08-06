import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-privacy-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="privacy-overlay" (click)="onOverlayClick($event)">
      <div class="privacy-card">
        <header class="privacy-modal-header">
          <div class="header-title-box">
            <div class="privacy-icon-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div>
              <h2>Aviso de Privacidad Integral</h2>
              <p class="header-sub">Protección y tratamiento transparente de tus datos</p>
            </div>
          </div>

          @if (!mandatory) {
            <button class="close-icon-btn" (click)="closeModal()">&times;</button>
          }
        </header>

        <div class="privacy-body">
          <p class="notice-date"><strong>Última actualización:</strong> Agosto 2026</p>
          
          <div class="notice-section">
            <h3>1. Identidad y Domicilio del Responsable</h3>
            <p><strong>Leños Rellenos</strong>, con domicilio en México, es responsable del tratamiento, uso y protección de sus datos personales conforme a la ley.</p>
          </div>

          <div class="notice-section">
            <h3>2. Datos Personales Recabados</h3>
            <p>Para procesar sus pedidos y brindarle un servicio de repostería artesanal de alta calidad, recabamos los siguientes datos personales:</p>
            <ul>
              <li>Nombre completo</li>
              <li>Correo electrónico</li>
              <li>Número telefónico de contacto</li>
              <li>Dirección o ubicación de entrega</li>
            </ul>
          </div>

          <div class="notice-section">
            <h3>3. Finalidades del Tratamiento de Datos</h3>
            <p>Sus datos personales son utilizados estrictamente para las siguientes finalidades primarias y necesarias:</p>
            <ul>
              <li>Procesamiento, preparación y entrega a domicilio de sus pedidos de leños rellenos.</li>
              <li>Confirmación de detalles del pedido a través de WhatsApp o llamada telefónica.</li>
              <li>Atención al cliente y resolución de solicitudes de derechos ARCO.</li>
            </ul>
          </div>

          <div class="notice-section">
            <h3>4. Protección de Datos y Derechos ARCO</h3>
            <p>Sus datos no serán transferidos a terceros sin su consentimiento explícito. Usted puede ejercer en cualquier momento sus Derechos ARCO (Acceso, Rectificación, Cancelación u Oposición) comunicándose con nosotros o ingresando a la sección de Solicitud de Derechos ARCO.</p>
          </div>
        </div>

        <footer class="privacy-modal-footer">
          @if (mandatory) {
            <div class="mandatory-actions">
              <p class="warning-text" style="display: flex; align-items: center; gap: 6px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="16" height="16">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Para realizar pedidos u operar en el sistema, debes aceptar nuestro Aviso de Privacidad.
              </p>
              <div class="btn-group">
                <button type="button" class="btn-reject" (click)="onReject()">Rechazar</button>
                <button type="button" class="btn-accept" [disabled]="isSubmitting" (click)="onAccept()">
                  {{ isSubmitting ? 'Guardando...' : 'Aceptar Aviso de Privacidad' }}
                </button>
              </div>
            </div>
          } @else {
            <button type="button" class="btn-close" (click)="closeModal()">Cerrar</button>
          }
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .privacy-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 10, 6, 0.82);
      backdrop-filter: blur(10px);
      z-index: 1100;
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

    .privacy-card {
      background: #ffffff;
      width: 100%;
      max-width: 620px;
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      max-height: 85vh;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      overflow: hidden;
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

    .privacy-modal-header {
      padding: 1.35rem 1.75rem;
      border-bottom: 1px solid #f0e6df;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #faf4ef;
    }

    .header-title-box {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .privacy-icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #ea580c;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 14px rgba(234, 88, 12, 0.3);
    }

    .privacy-icon-badge svg {
      width: 22px;
      height: 22px;
    }

    .privacy-modal-header h2 {
      margin: 0;
      color: #3b281c;
      font-size: 1.3rem;
      font-weight: 800;
    }

    .header-sub {
      font-size: 0.82rem;
      color: #7c685b;
      margin: 0;
    }

    .close-icon-btn {
      background: #ebdcd1;
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

    .close-icon-btn:hover {
      background: #ea580c;
      color: #ffffff;
    }

    .privacy-body {
      padding: 1.75rem;
      overflow-y: auto;
      font-size: 0.93rem;
      color: #4a382d;
      line-height: 1.6;
    }

    .notice-date {
      color: #7c685b;
      margin-bottom: 1.25rem;
      font-size: 0.85rem;
    }

    .notice-section {
      margin-bottom: 1.35rem;
    }

    .notice-section h3 {
      font-size: 1.05rem;
      color: #ea580c;
      margin-bottom: 0.4rem;
      font-weight: 700;
    }

    .notice-section ul {
      padding-left: 1.25rem;
      margin-top: 0.35rem;
    }

    .privacy-modal-footer {
      padding: 1.25rem 1.75rem;
      border-top: 1px solid #f0e6df;
      background: #ffffff;
    }

    .warning-text {
      font-size: 0.85rem;
      color: #dc2626;
      margin-bottom: 0.75rem;
      font-weight: 600;
    }

    .btn-group {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .btn-reject {
      padding: 0.7rem 1.35rem;
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-reject:hover {
      background: #fee2e2;
    }

    .btn-accept {
      padding: 0.7rem 1.5rem;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
      transition: transform 0.2s;
    }

    .btn-accept:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .btn-accept:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .btn-close {
      padding: 0.7rem 1.75rem;
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      float: right;
    }
  `]
})
export class PrivacyModalComponent {
  @Input() mandatory = false;
  @Output() accepted = new EventEmitter<void>();
  @Output() rejected = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  isSubmitting = false;
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  onOverlayClick(event: MouseEvent): void {
    if (!this.mandatory && (event.target as HTMLElement).classList.contains('privacy-overlay')) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  onAccept(): void {
    this.isSubmitting = true;
    if (this.authService.isAuthenticated()) {
      this.authService.aceptarAvisoPrivacidad().subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.success('Aviso de Privacidad aceptado y registrado en tu perfil.', 'Consentimiento Otorgado');
          this.accepted.emit();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error al aceptar aviso de privacidad:', err);
          this.authService.updatePrivacyStatus(true);
          this.toastService.success('Aviso de Privacidad aceptado correctamente.', 'Consentimiento Otorgado');
          this.accepted.emit();
        }
      });
    } else {
      this.authService.updatePrivacyStatus(true);
      this.isSubmitting = false;
      this.toastService.success('Aviso de Privacidad aceptado.', 'Consentimiento Otorgado');
      this.accepted.emit();
    }
  }

  onReject(): void {
    this.toastService.error('Has rechazado el Aviso de Privacidad. No podrás realizar pedidos en el sistema.', 'Acceso Restringido');
    this.rejected.emit();
  }
}
