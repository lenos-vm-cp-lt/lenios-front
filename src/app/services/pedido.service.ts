import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface PedidoItem {
  id_producto: string;
  cantidad: number;
  precio_unitario: number;
}

export interface PedidoCliente {
  nombre: string;
  telefono: string;
  ubicacion: string;
}

export interface PedidoPayload {
  cliente: PedidoCliente;
  productos_solicitados: PedidoItem[];
  total: number;
  metodoPago: string;
  metodoEntrega: string;
  notas?: string;
  consentimiento: boolean;
}

export interface PedidoCreado {
  _id: string;
  pedido_id?: string;
  whatsapp_url?: string;
  cliente: PedidoCliente;
  productos_solicitados: PedidoItem[];
  total: number;
  estado: string;
  createdAt: string;
  metodoPago?: string;
  metodoEntrega?: string;
  metodo_pago?: string;
  metodo_entrega?: string;
  metodo_envio?: string;
  notas?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly http = inject(HttpClient);
  // Endpoint de acuerdo a los requerimientos
  private readonly apiUrl = `${environment.apiUrl}/pedidos`;

  /**
   * Crea un nuevo pedido enviando los datos al backend.
   * @param payload Datos del pedido.
   */
  crearPedido(payload: PedidoPayload): Observable<PedidoCreado> {
    return this.http.post<ApiResponse<PedidoCreado>>(this.apiUrl, payload).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        throw new Error(response?.message || 'Error al crear el pedido.');
      })
    );
  }

  /**
   * Obtiene la lista completa de pedidos.
   */
  getPedidos(): Observable<PedidoCreado[]> {
    return this.http.get<ApiResponse<PedidoCreado[]>>(this.apiUrl).pipe(
      map(response => {
        if (response && response.success && Array.isArray(response.data)) {
          return response.data;
        }
        return response?.data || [];
      })
    );
  }

  /**
   * Actualiza el estado de un pedido específico.
   * @param id ID del pedido a actualizar.
   * @param estado Nuevo estado.
   */
  updateEstadoPedido(id: string, estado: string): Observable<PedidoCreado> {
    return this.http.patch<ApiResponse<PedidoCreado>>(`${this.apiUrl}/${id}/estado`, { estado }).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        throw new Error(response?.message || 'Error al actualizar el estado del pedido.');
      })
    );
  }
}
