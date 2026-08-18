/**
 * Patrón Repository / Abstracción de Datos (Frontend):
 * Abstrae el acceso a datos remotos mediante la API REST y desacopla la persistencia/servicios de los componentes de la interfaz de usuario.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$: Observable<ToastMessage[]> = this.toastsSubject.asObservable();

  show(message: string, type: ToastType = 'info', title?: string, duration: number = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, message, type, title, duration };
    
    const currentToasts = this.toastsSubject.getValue();
    this.toastsSubject.next([...currentToasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, title: string = '¡Éxito!'): void {
    this.show(message, 'success', title);
  }

  warning(message: string, title: string = 'Atención'): void {
    this.show(message, 'warning', title);
  }

  error(message: string, title: string = 'Error'): void {
    this.show(message, 'error', title);
  }

  info(message: string, title: string = 'Información'): void {
    this.show(message, 'info', title);
  }

  remove(id: string): void {
    const updatedToasts = this.toastsSubject.getValue().filter(t => t.id !== id);
    this.toastsSubject.next(updatedToasts);
  }
}
