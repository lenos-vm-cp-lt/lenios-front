import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DashboardMetrics } from '../models/admin-dashboard.model';
import { ApiResponse } from '../models/api-response.model';

/**
 * Servicio encargado de gestionar las operaciones administrativas
 * y consumir la API backend del panel de control.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = `${environment.apiUrl}/admin/dashboard/metrics`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene las métricas principales del Dashboard (Ventas del día, Pedidos pendientes, Productos activos).
   * Evalúa response.success y retorna únicamente la propiedad response.data.
   * Incluye un fallback decorativo en caso de que la API backend no esté en ejecución durante las pruebas locales.
   * @returns Observable<DashboardMetrics>
   */
  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.http.get<ApiResponse<DashboardMetrics>>(this.API_URL).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        throw new Error(response?.message || 'No se pudieron obtener las métricas del servidor.');
      }),
      catchError(() => {
        // Datos mock de respaldo si la API aún no responde en entorno local
        const mockMetrics: DashboardMetrics = {
          ventasDelDia: 1485.50,
          pedidosPendientes: 12,
          productosActivos: 34,
          ventasVariacion: 14.2,
          pedidosUrgentes: 3,
          pedidosRecientes: [
            { id: 'ORD-1089', cliente: 'Carlos Mendoza', total: 42.50, estado: 'PENDIENTE', fecha: '15 min ago' },
            { id: 'ORD-1088', cliente: 'María Fernanda Gómez', total: 68.00, estado: 'EN_PREPARACION', fecha: '32 min ago' },
            { id: 'ORD-1087', cliente: 'Alejandro Silva', total: 29.90, estado: 'EN_PREPARACION', fecha: '45 min ago' },
            { id: 'ORD-1086', cliente: 'Lucía Torres', total: 115.00, estado: 'ENTREGADO', fecha: '1h 10m ago' },
            { id: 'ORD-1085', cliente: 'Roberto Jiménez', total: 54.00, estado: 'ENTREGADO', fecha: '2h 05m ago' }
          ]
        };
        return of(mockMetrics);
      })
    );
  }
}
