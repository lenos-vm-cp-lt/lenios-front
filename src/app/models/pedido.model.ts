export interface ProductoSolicitado {
  id_producto: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export interface ClienteEmbebido {
  nombre: string;
  telefono: string;
  ubicacion: string;
}

export type EstadoPedido = 'Pendiente' | 'En preparacion' | 'Entregado' | 'Cancelado';

export interface Pedido {
  _id: string;
  cliente: ClienteEmbebido;
  productos_solicitados: ProductoSolicitado[];
  total: number;
  estado: EstadoPedido;
  metodo_envio: string;
  observaciones: string;
  createdAt: string;
  updatedAt: string;
}