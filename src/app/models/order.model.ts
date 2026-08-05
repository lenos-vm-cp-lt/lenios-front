/**
 * Interfaz para representar los datos de contacto y entrega del cliente.
 */
export interface ClienteData {
  nombre: string;
  telefono: string;
  ubicacion: string;
}

/**
 * Interfaz para representar cada producto dentro de la petición POST al backend.
 */
export interface ProductoSolicitadoPayload {
  producto: string;       // ID de MongoDB (_id)
  cantidad: number;         // Cantidad seleccionada
  precioUnitario: number;   // Precio unitario
}

/**
 * DTO para la creación de un nuevo pedido enviado a POST /api/v1/pedidos.
 */
export interface CrearPedidoDTO {
  cliente: ClienteData;
  productos_solicitados: ProductoSolicitadoPayload[];
  metodoPago: string;
  metodoEntrega: string;
  metodo_pago?: string;
  metodo_entrega?: string;
  notas?: string;
}

/**
 * Interfaz para la estructura del producto en la respuesta del backend.
 */
export interface ProductoRespuesta {
  _id?: string;
  nombre?: string;
  precio?: number;
  name?: string;
}

/**
 * Interfaz para cada ítem de producto dentro de un pedido ya creado.
 */
export interface ProductoSolicitadoRespuesta {
  producto: ProductoRespuesta | string;
  cantidad: number;
  precioUnitario: number;
}

/**
 * Interfaz que representa la orden/pedido creada y retornada por la API REST.
 */
export interface PedidoCreado {
  _id: string;
  cliente: ClienteData;
  productos_solicitados: ProductoSolicitadoRespuesta[];
  total: number;
  estado: string;
  metodoPago?: string;
  metodoEntrega?: string;
  metodo_pago?: string;
  metodo_entrega?: string;
  metodo_envio?: string;
  notas?: string;
  createdAt?: string;
}

/**
 * Interfaz alternativa para ítems individuales de carrito.
 */
export interface ItemCarrito {
  productoId: string;       // ID de MongoDB (_id)
  nombre: string;           // Nombre del leño o bebida
  cantidad: number;         // Cantidad seleccionada
  precioUnitario: number;   // Precio al momento de agregar
}
