import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { DashboardMetrics } from '../../../models/admin-dashboard.model';

/**
 * Componente Standalone del Panel de Control (Dashboard) de Administración.
 * Muestra tarjetas responsivas con los indicadores clave (KPIs) del negocio:
 * Ventas del día, Pedidos pendientes y Productos activos, alimentados desde el `AdminService`.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  /** Datos e indicadores de métricas del Dashboard */
  metrics: DashboardMetrics | null = null;

  /** Estado de carga de las métricas */
  isLoading: boolean = true;

  /** Mensaje de error si la carga falla */
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadMetrics();
  }

  /**
   * Carga los indicadores clave consumiendo el `AdminService`.
   */
  loadMetrics(): void {
    this.isLoading = true;
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
      case 'ENTREGADO': return 'badge-success';
      case 'CANCELADO': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }
}
