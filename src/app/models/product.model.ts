/**
 * Interfaz que representa un producto de leño relleno en el catálogo.
 */
export interface Product {
  /** Identificador único del producto */
  id: number | string;

  /** ID de MongoDB de Mongoose (ObjectId) */
  _id?: string;

  /** Nombre comercial del leño relleno */
  name: string;

  /** Descripción detallada del relleno, cobertura e ingredientes clave */
  description: string;

  /** Precio en la divisa local */
  price: number;

  /** Ruta o URL de la imagen del producto (formato WebP preferido) */
  imageUrl: string;

  /** Categoría del producto (ej. 'Dulce', 'Salado', 'Gourmet', 'Edición Especial') */
  category?: string;

  /** Etiqueta destacada opcional (ej. 'Más Vendido', 'Nuevo', 'Gluten Free') */
  badge?: string;

  /** Indica si el producto debe mostrarse en el carrusel principal de la Home */
  featured?: boolean;

  /** Calificación o rating de 1 a 5 estrellas */
  rating?: number;

  /** Tiempo estimado de preparación o horneado en minutos */
  prepTime?: string;
  
  /** Indica si el producto está disponible para la venta */
  disponible?: boolean;
  
  /** Cantidad de producto disponible en inventario */
  stock?: number;
}
