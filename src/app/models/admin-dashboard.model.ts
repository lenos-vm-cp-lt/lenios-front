/**
 * Interfaz para representar un pedido reciente en el Dashboard
 */
export interface RecentOrder {
  id: string;
  cliente: string;
  total: number;
  estado: 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO';
  fecha: string;
}

/**
 * Interfaz con la estructura de métricas clave del Dashboard de Administración
 */
export interface DashboardMetrics {
  ventasDelDia: number;
  pedidosPendientes: number;
  productosActivos: number;
  ventasVariacion: number;
  pedidosUrgentes: number;
  pedidosRecientes: RecentOrder[];
}
