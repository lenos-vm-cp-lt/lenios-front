import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" role="region" aria-live="polite">
      @for (toast of toasts$ | async; track toast.id) {
        <div class="toast-card" [ngClass]="'toast-' + toast.type">
          <div class="toast-icon-wrapper">
            @switch (toast.type) {
              @case ('success') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              }
              @case ('warning') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              }
              @case ('error') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              }
              @default {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              }
            }
          </div>

          <div class="toast-content">
            @if (toast.title) {
              <strong class="toast-title">{{ toast.title }}</strong>
            }
            <p class="toast-message">{{ toast.message }}</p>
          </div>

          <button class="toast-close-btn" (click)="closeToast(toast.id)" aria-label="Cerrar notificación">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
      width: calc(100vw - 3rem);
      pointer-events: none;
    }

    .toast-card {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 1rem 1.15rem;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08);
      border-left: 5px solid #888;
      animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      transition: transform 0.2s ease, opacity 0.2s ease;
    }

    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateX(100%) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    /* Colores correspondientes */
    .toast-card.toast-success {
      border-left-color: #10b981;
      background: linear-gradient(135deg, #ffffff 60%, #ecfdf5);
    }
    .toast-card.toast-success .toast-icon-wrapper {
      background: #10b981;
      color: #ffffff;
    }
    .toast-card.toast-success .toast-title {
      color: #065f46;
    }

    .toast-card.toast-warning {
      border-left-color: #f59e0b;
      background: linear-gradient(135deg, #ffffff 60%, #fffbeb);
    }
    .toast-card.toast-warning .toast-icon-wrapper {
      background: #f59e0b;
      color: #ffffff;
    }
    .toast-card.toast-warning .toast-title {
      color: #92400e;
    }

    .toast-card.toast-error {
      border-left-color: #ef4444;
      background: linear-gradient(135deg, #ffffff 60%, #fef2f2);
    }
    .toast-card.toast-error .toast-icon-wrapper {
      background: #ef4444;
      color: #ffffff;
    }
    .toast-card.toast-error .toast-title {
      color: #991b1b;
    }

    .toast-card.toast-info {
      border-left-color: #3b82f6;
      background: linear-gradient(135deg, #ffffff 60%, #eff6ff);
    }
    .toast-card.toast-info .toast-icon-wrapper {
      background: #3b82f6;
      color: #ffffff;
    }
    .toast-card.toast-info .toast-title {
      color: #1e40af;
    }

    .toast-icon-wrapper {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    .toast-icon-wrapper svg {
      width: 18px;
      height: 18px;
    }

    .toast-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .toast-title {
      font-size: 0.92rem;
      font-weight: 700;
    }

    .toast-message {
      font-size: 0.85rem;
      color: #374151;
      margin: 0;
      line-height: 1.4;
    }

    .toast-close-btn {
      background: none;
      border: none;
      font-size: 1.4rem;
      color: #9ca3af;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      transition: color 0.2s;
    }

    .toast-close-btn:hover {
      color: #1f2937;
    }
  `]
})
export class ToastComponent {
  private toastService = inject(ToastService);
  toasts$: Observable<ToastMessage[]> = this.toastService.toasts$;

  closeToast(id: string): void {
    this.toastService.remove(id);
  }
}
