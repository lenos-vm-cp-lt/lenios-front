/**
 * Patrón Repository / Abstracción de Datos (Frontend):
 * Abstrae el acceso a datos remotos mediante la API REST y desacopla la persistencia/servicios de los componentes de la interfaz de usuario.
 */

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
      })
    );
  }
}
