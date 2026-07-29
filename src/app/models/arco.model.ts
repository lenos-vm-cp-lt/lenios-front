/**
 * Tipos de derechos ARCO disponibles para solicitud por parte del cliente.
 */
export type TipoDerechoARCO = 'ACCESO' | 'RECTIFICACION' | 'CANCELACION' | 'OPOSICION';

/**
 * Estructura de datos para enviar la solicitud de Derechos ARCO a la API.
 */
export interface SolicitudArcoRequest {
  nombreCompleto: string;
  email: string;
  telefono: string;
  tipoDerecho: TipoDerechoARCO;
  motivo: string;
}

/**
 * Estructura de respuesta generada por la API tras registrar exitosamente una solicitud ARCO.
 */
export interface SolicitudArcoResponse {
  folio: string;
  mensaje?: string;
  fechaRegistro?: string;
}
