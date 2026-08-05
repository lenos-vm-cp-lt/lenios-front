import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { DashboardMetrics } from '../../../models/admin-dashboard.model';
import { Subscription, interval } from 'rxjs';

/**
 * Componente Standalone del Panel de Control (Dashboard) de Administración.
 * Muestra tarjetas responsivas con los indicadores clave (KPIs) del negocio:
 * Ventas del día, Pedidos pendientes y Productos activos, alimentados desde el `AdminService`.
 * Incluye actualización en tiempo real mediante sondeo (polling) automático.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private refreshSub?: Subscription;

  /** Datos e indicadores de métricas del Dashboard */
  metrics: DashboardMetrics | null = null;

  /** Estado de carga de las métricas */
  isLoading = true;

  /** Mensaje de error si la carga falla */
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadMetrics(true);
    // Configurar actualización automática en tiempo real cada 10 segundos
    this.refreshSub = interval(10000).subscribe(() => {
      this.loadMetrics(false);
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }

  /**
   * Carga los indicadores clave consumiendo el `AdminService`.
   * @param showSpinner Si es true, activa la animación de spinner global.
   */
  loadMetrics(showSpinner: boolean = true): void {
    if (showSpinner) {
      this.isLoading = true;
    }
    this.errorMessage = null;

    this.adminService.getDashboardMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar métricas del Dashboard:', err);
        this.errorMessage = err?.error?.message || err?.error?.error || err?.message || 'No se pudieron cargar los datos del panel de control.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Retorna una clase CSS representativa según el estado del pedido.
   */
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDIENTE': return 'badge-warning';
      case 'EN_PREPARACION': return 'badge-info';
      case 'EN_CAMINO': return 'badge-info';
      case 'ENTREGADO': return 'badge-success';
      case 'CANCELADO': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }
}
