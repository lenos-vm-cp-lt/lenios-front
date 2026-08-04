import { Product } from './product.model';

/**
 * Interfaz que representa un ítem individual dentro del carrito de compras.
 * Contiene la referencia al objeto `Product` y la cantidad seleccionada.
 */
export interface CartItem {
  /** Objeto del producto del catálogo */
  product: Product;

  /** Cantidad de unidades de este producto en el carrito */
  quantity: number;
}
