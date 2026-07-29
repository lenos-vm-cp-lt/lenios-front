import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente Standalone de gestión de Productos en el Módulo de Administración.
 */
@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Gestión de Productos</h1>
        <p class="page-subtitle">Administra el catálogo, precios, categorías y disponibilidad de los platos de Leños Rellenos</p>
      </div>

      <div class="placeholder-card">
        <div class="icon-box">📦</div>
        <h2>Módulo de Productos en desarrollo</h2>
        <p>Aquí se listarán y gestionarán todos los productos activos e inventario.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-title { font-size: 1.8rem; font-weight: 700; color: var(--color-brown-darkest); }
    .page-subtitle { font-size: 0.95rem; color: var(--color-text-muted); }
    .placeholder-card {
      background: var(--color-bg-card);
      border: 1px dashed var(--color-border-subtle);
      border-radius: var(--radius-lg);
      padding: 4rem 2rem;
      text-align: center;
      box-shadow: var(--shadow-sm);
    }
    .icon-box { font-size: 3rem; margin-bottom: 1rem; }
    h2 { font-size: 1.25rem; color: var(--color-brown-dark); margin-bottom: 0.5rem; }
    p { color: var(--color-text-muted); }
  `]
})
export class AdminProductosComponent {}
