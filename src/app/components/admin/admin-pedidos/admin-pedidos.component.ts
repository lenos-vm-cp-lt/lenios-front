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
  styleUrls: ['./admin-pedidos.component.css'] // O pega tus estilos abajo en `styles` si usas estilos inline
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
    
    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }
    .modal-content {
      background: #ffffff;
      border-radius: var(--radius-lg);
      width: 90%; max-width: 600px; max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
      animation: slideUp 0.3s ease-out;
    }
    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex; justify-content: space-between; align-items: center;
      position: sticky; top: 0; background: #ffffff; z-index: 10;
    }
    .modal-header h2 { margin: 0; font-size: 1.25rem; color: var(--color-brown-darkest); }
    .btn-close { background: none; border: none; cursor: pointer; color: var(--color-text-muted); display: flex; padding: 0.25rem; border-radius: var(--radius-sm); }
    .btn-close:hover { background: var(--color-background-soft); color: var(--color-text-main); }
    .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .detail-section h3 { font-size: 1rem; color: var(--color-brown-darkest); margin: 0 0 0.75rem 0; display: flex; align-items: center; gap: 0.5rem; }
    .detail-section p { margin: 0 0 0.5rem 0; font-size: 0.95rem; color: var(--color-text-main); }
    .detail-section.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .notes-text { background: var(--color-background-soft); padding: 0.75rem; border-radius: var(--radius-sm); border-left: 3px solid var(--color-orange-primary); font-style: italic; }
    .modal-table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
    .modal-table th, .modal-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border-color); font-size: 0.95rem; }
    .modal-table th { font-weight: 600; color: var(--color-text-muted); background: var(--color-background-soft); }
    .modal-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-color); margin-top: 0.5rem; }
    .modal-status { display: flex; flex-direction: column; gap: 0.5rem; }
    .date-info { font-size: 0.8rem; color: var(--color-text-muted); }
    .modal-total { font-size: 1.25rem; color: var(--color-brown-darkest); display: flex; align-items: baseline; gap: 0.5rem; }
    .modal-total strong { color: var(--color-orange-primary); font-size: 1.5rem; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
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
      error: (err: Error) => {
        console.error('Error al cargar pedidos:', err);
        this.errorMessage = err.message || 'Error al obtener la lista de pedidos.';
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