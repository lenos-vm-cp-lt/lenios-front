/**
 * Patrón Repository / Abstracción de Datos (Frontend):
 * Abstrae el acceso a datos remotos mediante la API REST y desacopla la persistencia/servicios de los componentes de la interfaz de usuario.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { CartItem } from '../models/cart-item.model';

export interface OrderItem {
  productoId: string | number;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Order {
  id?: string;
  cliente: string;
  email: string;
  telefono: string;
  direccion: string;
  items: OrderItem[];
  subtotal: number;
  envio: number;
  total: number;
  estado: 'PENDIENTE' | 'EN_PREPARACION' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  fecha?: string;
}

/**
 * Servicio encargado de gestionar los pedidos del restaurante.
 * Adapta todas las llamadas HTTP al formato ApiResponse<T> ({ success, message, data }).
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  /**
   * Obtiene la lista completa de pedidos (para el módulo de administración).
   * Evalúa response.success y retorna response.data.
   */
  getOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(this.apiUrl).pipe(
      map(response => {
        if (response && response.success && Array.isArray(response.data)) {
          return response.data;
        }
        return response?.data || [];
      })
    );
  }

  /**
   * Obtiene la información de un pedido por su ID.
   */
  getOrderById(id: string): Observable<Order> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        throw new Error(response?.message || 'No se encontró la información del pedido.');
      })
    );
  }

  /**
   * Registra un nuevo pedido tras el checkout en el carrito.
   */
  createOrder(orderData: Omit<Order, 'id'>): Observable<Order> {
    return this.http.post<ApiResponse<Order>>(this.apiUrl, orderData).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        throw new Error(response?.message || 'No se pudo crear el pedido.');
      })
    );
  }

  /**
   * Actualiza el estado de un pedido (ej: PENDIENTE -> EN_PREPARACION -> ENTREGADO).
   */
  updateOrderStatus(id: string, estado: Order['estado']): Observable<Order> {
    return this.http.put<ApiResponse<Order>>(`${this.apiUrl}/${id}/status`, { estado }).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        throw new Error(response?.message || 'No se pudo actualizar el estado del pedido.');
      })
    );
  }

  /**
   * Cancela un pedido existente.
   */
  cancelOrder(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        return !!(response && response.success);
      })
    );
  }
}
