import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoPedido, Pedido } from '../models/pedido.model';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private readonly API_URL = 'http://localhost:3000/api/v1/pedidos';

  constructor(private http: HttpClient) {}

  obtenerPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.API_URL);
  }

  actualizarEstado(id: string, estado: EstadoPedido): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.API_URL}/${id}/estado`, { estado });
  }
}