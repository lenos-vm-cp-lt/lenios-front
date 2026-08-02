/**
 * DTO estándar de respuesta HTTP del backend.
 * Todas las respuestas exitosas o fallidas se estructuran bajo esta interfaz.
 */
export interface ApiResponse<T = any> {
  /** Indica si la operación fue procesada exitosamente en el servidor */
  success: boolean;
  /** Mensaje informativo o descripción devuelta por el servidor */
  message: string;
  /** Datos reales de negocio retornados por la API */
  data: T;
}
