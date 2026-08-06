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
  templateUrl: './admin-pedidos.component.html',
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