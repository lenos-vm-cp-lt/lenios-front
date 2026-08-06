import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService, PedidoCreado, PedidoItem } from '../../../services/pedido.service';

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

      <!-- Alertas de estado -->
      @if (successMessage) {
        <div class="alert alert-success" role="alert">
          <span>✅ {{ successMessage }}</span>
        </div>
      }

      @if (errorMessage) {
        <div class="alert alert-danger" role="alert">
          <span>⚠️ {{ errorMessage }}</span>
        </div>
      }

      <!-- Listado de Pedidos -->
      <div class="card table-card">
        <div class="table-header-row">
          <h2>Órdenes Recientes</h2>
          <button class="btn btn-primary" (click)="loadPedidos()">
            🔄 Actualizar
          </button>
        </div>
        
        @if (isLoading) {
          <div class="loading-state">
            <p>Cargando pedidos...</p>
          </div>
        } @else {
          @if (pedidos.length === 0) {
            <div class="empty-state">
              <p>No se encontraron pedidos registrados.</p>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="products-table">
                <thead>
                  <tr>
                    <th>ID Pedido</th>
                    <th>Cliente</th>
                    <th>Método / Pago</th>
                    <th>Resumen</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Actualizar Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (pedido of pedidos; track pedido._id) {
                    <tr>
                      <td><strong>#{{ pedido._id | slice:-6 }}</strong></td>
                      <td>
                        <div class="client-info">
                          <span class="client-name">{{ pedido.cliente.nombre || 'Sin nombre' }}</span>
                          <span class="client-phone">📞 {{ pedido.cliente.telefono || 'N/A' }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="delivery-info">
                          <span class="badge-cat">{{ pedido.metodoEntrega || 'Local' }}</span>
                          <span class="payment-method">💳 {{ pedido.metodoPago || 'N/A' }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="order-summary-items">
                          {{ getResumenProductos(pedido) }}
                        </div>
                      </td>
                      <td>\${{ (pedido.total || 0).toFixed(2) }}</td>
                      <td>
                        <span class="status-badge" [ngClass]="getBadgeClass(pedido.estado)">
                          {{ pedido.estado || 'Pendiente' }}
                        </span>
                      </td>
                      <td>
                        <select 
                          class="form-control select-input select-status" 
                          [ngModel]="pedido.estado"
                          (ngModelChange)="onStatusChange(pedido, $event)"
                          [disabled]="updatingPedidoId === pedido._id">
                          <option value="Pendiente">Pendiente</option>
                          <option value="En preparacion">En Preparación</option>
                          <option value="En Camino">En Camino</option>
                          <option value="Entregado">Entregado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td>
                        <button class="btn btn-icon btn-view" (click)="openModal(pedido)" aria-label="Ver Detalles" title="Ver Detalles">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      </div>
    </div>

    <!-- Modal de Detalles del Pedido -->
    @if (selectedPedido) {
      <div class="modal-overlay" (click)="closeModal()" (keydown.escape)="closeModal()" (keydown.enter)="closeModal()" tabindex="0">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Detalles del Pedido <strong>#{{ selectedPedido._id | slice:-6 }}</strong></h2>
            <button class="btn-close" (click)="closeModal()" aria-label="Cerrar modal">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="detail-section">
              <h3><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Datos del Cliente</h3>
              <p><strong>Nombre:</strong> {{ selectedPedido.cliente.nombre }}</p>
              <p><strong>Teléfono:</strong> {{ selectedPedido.cliente.telefono }}</p>
              <p><strong>Dirección / Ubicación:</strong> {{ selectedPedido.cliente.ubicacion }}</p>
            </div>
            
            <div class="detail-section grid-2">
              <div>
                <h3><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg> Método de Pago</h3>
                <p>{{ selectedPedido.metodoPago || 'No especificado' }}</p>
              </div>
              <div>
                <h3><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg> Método de Entrega</h3>
                <p>{{ selectedPedido.metodoEntrega || 'No especificado' }}</p>
              </div>
            </div>

            <div class="detail-section">
              <h3><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Notas Adicionales</h3>
              <p class="notes-text">{{ selectedPedido.notas || 'Sin notas' }}</p>
            </div>

            <div class="detail-section">
              <h3><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg> Productos Solicitados</h3>
              <table class="modal-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Precio U.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of selectedPedido.productos_solicitados; track item.id_producto) {
                    <tr>
                      <td>{{ getProductName(item) }}</td>
                      <td>{{ item.cantidad }}</td>
                      <td>\${{ item.precio_unitario.toFixed(2) }}</td>
                      <td>\${{ (item.cantidad * item.precio_unitario).toFixed(2) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            
            <div class="modal-footer">
              <div class="modal-status">
                <span class="status-badge" [ngClass]="getBadgeClass(selectedPedido.estado)">
                  {{ selectedPedido.estado }}
                </span>
                <span class="date-info">{{ selectedPedido.createdAt | date:'short' }}</span>
              </div>
              <div class="modal-total">
                <span>Total:</span>
                <strong>\${{ selectedPedido.total.toFixed(2) }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-title { font-size: 1.8rem; font-weight: 700; color: var(--color-brown-darkest); }
    .page-subtitle { font-size: 0.95rem; color: var(--color-text-muted); }
    
    .alert { padding: 0.85rem 1.25rem; border-radius: var(--radius-md); font-weight: 500; font-size: 0.9rem; margin-bottom: 0.5rem; }
    .alert-success { background: #D1FAE5; border: 1px solid #10B981; color: #065F46; }
    .alert-danger { background: #FEE2E2; border: 1px solid #F87171; color: #991B1B; }
    
    .card { background: var(--color-bg-card); border-radius: var(--radius-lg); padding: 1.75rem; box-shadow: var(--shadow-sm); border: 1px solid var(--color-border-subtle); }
    
    .table-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      border-bottom: 2px solid var(--color-orange-subtle);
      padding-bottom: 0.5rem;
    }
    
    h2 { font-size: 1.2rem; color: var(--color-brown-dark); margin: 0; }
    
    .form-control {
      padding: 0.45rem 0.65rem;
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      outline: none;
      background: #fff;
    }
    .select-input {
      cursor: pointer;
    }
    .form-control:focus {
      border-color: var(--color-orange-primary);
    }
    .select-status {
      min-width: 130px;
    }
    
    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }

    .products-table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
    .products-table th, .products-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--color-border-subtle); font-size: 0.9rem; vertical-align: middle; }
    .products-table th { background-color: var(--color-bg-cream); color: var(--color-brown-dark); font-weight: 700; }
    
    .badge-cat { background: var(--color-orange-subtle); color: var(--color-orange-primary); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; display: inline-block; margin-bottom: 0.2rem;}
    
    .client-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .client-name { font-weight: 600; color: var(--color-brown-darkest); }
    .client-phone { font-size: 0.75rem; color: var(--color-text-muted); }
    
    .delivery-info { display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start; }
    .payment-method { font-size: 0.75rem; color: var(--color-text-muted); }

    .order-summary-items {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .status-badge {
      display: inline-block;
      padding: 0.3rem 0.6rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    
    .status-badge.estado-pendiente { background: #FEF3C7; color: #D97706; }
    .status-badge.estado-en-preparacion { background: #E0F2FE; color: #0369A1; }
    .status-badge.estado-en-camino { background: #F3E8FF; color: #7E22CE; }
    .status-badge.estado-entregado { background: #D1FAE5; color: #065F46; }
    .status-badge.estado-cancelado { background: #FEE2E2; color: #991B1B; }

    .btn { padding: 0.5rem 1rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; border: none; font-size: 0.85rem; }
    .btn-primary { background: var(--color-orange-primary); color: #fff; }
    .btn-primary:hover { background: var(--color-orange-bright); }
    .btn-icon { padding: 0.4rem; background: transparent; color: var(--color-text-muted); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; }
    .btn-icon:hover { background: var(--color-background-soft); color: var(--color-orange-primary); border-color: var(--color-orange-primary); }

    .loading-state, .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
      color: var(--color-text-muted);
    }
    
    /* Modal Styles Premium */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(18, 11, 7, 0.82);
      backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center;
      z-index: 1100;
      padding: 1.25rem;
      animation: fadeIn 0.25s ease-out;
    }
    .modal-content {
      background: #ffffff;
      border-radius: 24px;
      width: 100%; max-width: 800px; max-height: 90vh;
      display: flex; flex-direction: column;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      border: 1px solid #f0e6df;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .modal-header {
      padding: 1.25rem 1.75rem;
      border-bottom: 1px solid #f0e6df;
      display: flex; justify-content: space-between; align-items: center;
      flex-shrink: 0;
      background: #faf4ef;
      z-index: 10;
    }
    .modal-header h2 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #3b281c; }
    .modal-header h2 strong { color: #ea580c; }
    .btn-close {
      background: #f3eae3;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 1.4rem;
      color: #6b5548;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-close:hover { background: #ea580c; color: #ffffff; }
    .modal-body {
      padding: 1.5rem 1.75rem;
      display: flex; flex-direction: column; gap: 1.25rem;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }
    .detail-section {
      background: #faf4ef;
      padding: 1.25rem;
      border-radius: 16px;
      border: 1px solid #f0e6df;
    }
    .detail-section h3 { font-size: 0.98rem; font-weight: 700; color: #ea580c; margin: 0 0 0.75rem 0; display: flex; align-items: center; gap: 0.5rem; }
    .detail-section p { margin: 0 0 0.4rem 0; font-size: 0.92rem; color: #4a382d; }
    .detail-section p strong { color: #3b281c; }
    .detail-section.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .notes-text { background: #fff8f3; padding: 0.85rem 1rem; border-radius: 12px; border-left: 4px solid #ea580c; font-style: italic; color: #6b5548; margin: 0; }
    .modal-table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; border-radius: 12px; overflow: hidden; border: 1px solid #e7dcd3; }
    .modal-table th, .modal-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #f0e6df; font-size: 0.9rem; }
    .modal-table th { font-weight: 700; color: #4a382d; background: #f8f2ed; }
    .modal-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.25rem 1.75rem;
      border-top: 1px solid #f0e6df;
      background: #ffffff;
      flex-shrink: 0;
      z-index: 10;
    }
    .modal-status { display: flex; flex-direction: column; gap: 0.35rem; }
    .date-info { font-size: 0.82rem; color: #7c685b; }
    .modal-total { font-size: 1.1rem; font-weight: 700; color: #3b281c; display: flex; align-items: baseline; gap: 0.5rem; }
    .modal-total strong { color: #ea580c; font-size: 1.6rem; font-weight: 800; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: scale(0.94) translateY(15px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
  `]
})
export class AdminPedidosComponent implements OnInit {
  private pedidoService = inject(PedidoService);

  pedidos: PedidoCreado[] = [];
  isLoading = false;
  updatingPedidoId: string | null = null;
  selectedPedido: PedidoCreado | null = null;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.pedidoService.getPedidos().subscribe({
      next: (pedidosList) => {
        this.pedidos = pedidosList.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar pedidos:', err);
        if (err.status === 403) {
          this.errorMessage = 'Acceso denegado (403): Tu cuenta no posee permisos de administrador (requiere rol admin o editor).';
        } else {
          this.errorMessage = err.message || 'Error al obtener la lista de pedidos.';
        }
        this.isLoading = false;
      }
    });
  }

  onStatusChange(pedido: PedidoCreado, nuevoEstado: string): void {
    if (pedido.estado === nuevoEstado) return;

    this.updatingPedidoId = pedido._id;
    this.successMessage = null;
    this.errorMessage = null;

    this.pedidoService.updateEstadoPedido(pedido._id, nuevoEstado).subscribe({
      next: (pedidoActualizado) => {
        pedido.estado = pedidoActualizado.estado;
        if (nuevoEstado === 'Entregado' || (pedidoActualizado as any).pago_recibido || (pedidoActualizado as any).pagoRecibido) {
          pedido.pagoRecibido = true;
          pedido.pago_recibido = true;
          pedido.estadoPago = 'Pagado';
          pedido.estado_pago = 'Pagado';
        }
        this.updatingPedidoId = null;
        this.successMessage = `Estado del pedido #${pedido._id.slice(-6)} actualizado a "${nuevoEstado}".`;
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err: Error) => {
        console.error('Error al cambiar estado:', err);
        this.updatingPedidoId = null;
        this.errorMessage = err.message || 'No se pudo actualizar el estado del pedido.';

        const estadoAnterior = pedido.estado;
        pedido.estado = '';
        setTimeout(() => {
          pedido.estado = estadoAnterior;
        });
      }
    });
  }

  onPagoChange(pedido: PedidoCreado, nuevoPagoStatus: string): void {
    if (!pedido || !pedido._id) return;
    const isPagado = nuevoPagoStatus === 'Pagado';

    this.updatingPedidoId = pedido._id;
    this.errorMessage = null;

    this.pedidoService.updatePagoPedido(pedido._id, isPagado, nuevoPagoStatus).subscribe({
      next: (pedidoActualizado) => {
        pedido.pagoRecibido = isPagado;
        pedido.pago_recibido = isPagado;
        pedido.estadoPago = isPagado ? 'Pagado' : 'Pendiente';
        pedido.estado_pago = isPagado ? 'Pagado' : 'Pendiente';
        this.updatingPedidoId = null;
        this.successMessage = `Pago del pedido #${pedido._id.slice(-6)} actualizado a "${isPagado ? 'Pago Recibido' : 'Pendiente'}".`;
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err: Error) => {
        console.error('Error al actualizar pago:', err);
        this.updatingPedidoId = null;
        this.errorMessage = err.message || 'No se pudo actualizar el estado de pago del pedido.';
      }
    });
  }

  getBadgeClass(estado: string): string {
    if (!estado) return 'estado-pendiente';
    const normalized = estado.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `estado-${normalized}`;
  }

  getResumenProductos(pedido: PedidoCreado): string {
    if (!pedido.productos_solicitados || !Array.isArray(pedido.productos_solicitados)) {
      return 'Sin detalles';
    }
    return pedido.productos_solicitados.map(p => {
      const prod = p as PedidoItem & { nombre?: string, producto?: { nombre: string } };
      return `${prod.cantidad}x ${prod.producto?.nombre || prod.nombre || 'Leño'}`;
    }).join(', ');
  }

  getProductName(item: PedidoItem): string {
    const prod = item as PedidoItem & { nombre?: string, producto?: { nombre: string } };
    return prod.producto?.nombre || prod.nombre || 'Producto Desconocido';
  }

  openModal(pedido: PedidoCreado): void {
    this.selectedPedido = pedido;
  }

  closeModal(): void {
    this.selectedPedido = null;
  }
}

