import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadoPedido, Pedido } from '../../../models/pedido.model';
import { PedidoService } from '../../../services/pedido.service';

/**
 * Componente Standalone de gestión de Pedidos en el Módulo de Administración.
 */
@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Gestión de Pedidos</h1>
        <p class="page-subtitle">Supervisa las órdenes entrantes, estados de despacho y atención al cliente</p>
      </div>

      <p *ngIf="cargando" class="mensaje-info">Cargando pedidos...</p>
      <p *ngIf="error" class="mensaje-error">{{ error }}</p>

      <div *ngIf="!cargando && pedidos.length > 0" class="tabla-wrapper">
        <table class="tabla-pedidos">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let pedido of pedidos">
              <td data-label="Cliente">{{ pedido.cliente.nombre }}</td>
              <td data-label="Teléfono">{{ pedido.cliente.telefono }}</td>
              <td data-label="Productos">
                <ul class="lista-productos">
                  <li *ngFor="let producto of pedido.productos_solicitados">
                    {{ producto.cantidad }}x {{ producto.nombre }}
                  </li>
                </ul>
              </td>
              <td data-label="Total">\${{ pedido.total }}</td>
              <td data-label="Estado">
                <span class="etiqueta-estado" [ngClass]="claseEstado(pedido.estado)">
                  {{ pedido.estado }}
                </span>
                <select
                  class="selector-estado"
                  [ngModel]="pedido.estado"
                  (ngModelChange)="cambiarEstado(pedido, $event)"
                >
                  <option *ngFor="let estado of estadosDisponibles" [value]="estado">
                    {{ estado }}
                  </option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!cargando && pedidos.length === 0 && !error" class="placeholder-card">
        <div class="icon-box">📋</div>
        <h2>No hay pedidos registrados</h2>
        <p>Cuando lleguen nuevos pedidos, aparecerán aquí.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-title { font-size: 1.8rem; font-weight: 700; color: var(--color-brown-darkest); }
    .page-subtitle { font-size: 0.95rem; color: var(--color-text-muted); }

    .mensaje-info { color: var(--color-text-muted); }
    .mensaje-error { color: #c0392b; font-weight: 600; }

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

    .tabla-wrapper {
      background: var(--color-bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow-x: auto;
      padding: 1rem;
    }

    .tabla-pedidos {
      width: 100%;
      border-collapse: collapse;
    }

    .tabla-pedidos th,
    .tabla-pedidos td {
      padding: 12px;
      text-align: left;
      vertical-align: top;
      border-bottom: 1px solid var(--color-border-subtle);
    }

    .tabla-pedidos th {
      color: var(--color-brown-darkest);
      font-weight: 700;
    }

    .lista-productos {
      margin: 0;
      padding-left: 16px;
    }

    .etiqueta-estado {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.8em;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .estado-pendiente { background: #fff3cd; color: #856404; }
    .estado-preparacion { background: #cce5ff; color: #004085; }
    .estado-entregado { background: #d4edda; color: #155724; }
    .estado-cancelado { background: #f8d7da; color: #721c24; }

    .selector-estado {
      display: block;
      margin-top: 4px;
      padding: 6px;
      border-radius: var(--radius-sm, 4px);
      border: 1px solid var(--color-border-subtle);
    }

    @media (max-width: 768px) {
      .tabla-pedidos, .tabla-pedidos thead, .tabla-pedidos tbody,
      .tabla-pedidos th, .tabla-pedidos td, .tabla-pedidos tr {
        display: block;
      }
      .tabla-pedidos thead { display: none; }
      .tabla-pedidos td {
        border: none;
        position: relative;
        padding-left: 45%;
      }
      .tabla-pedidos td::before {
        content: attr(data-label);
        position: absolute;
        left: 12px;
        font-weight: 700;
        color: var(--color-brown-darkest);
      }
    }
  `],
})
export class AdminPedidosComponent implements OnInit {
  private pedidoService = inject(PedidoService);

  pedidos: Pedido[] = [];
  cargando = true;
  error = '';

  estadosDisponibles: EstadoPedido[] = ['Pendiente', 'En preparacion', 'Entregado', 'Cancelado'];

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.cargando = true;
    this.error = '';
    this.pedidoService.obtenerPedidos().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los pedidos. Verifica tu conexión.';
        this.cargando = false;
      },
    });
  }

  cambiarEstado(pedido: Pedido, nuevoEstado: EstadoPedido): void {
    const estadoAnterior = pedido.estado;
    pedido.estado = nuevoEstado;

    this.pedidoService.actualizarEstado(pedido._id, nuevoEstado).subscribe({
      next: (pedidoActualizado) => {
        pedido.estado = pedidoActualizado.estado;
      },
      error: () => {
        pedido.estado = estadoAnterior;
        this.error = `No se pudo actualizar el pedido de ${pedido.cliente.nombre}.`;
      },
    });
  }

  claseEstado(estado: EstadoPedido): string {
    const mapa: Record<EstadoPedido, string> = {
      Pendiente: 'estado-pendiente',
      'En preparacion': 'estado-preparacion',
      Entregado: 'estado-entregado',
      Cancelado: 'estado-cancelado',
    };
    return mapa[estado];
  }
}