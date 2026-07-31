import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor HTTP funcional para el manejo global de errores.
 * Captura las respuestas fallidas del backend y extrae prioritariamente `error.error.message` o `error.error.error`
 * para estandarizar las alertas/notificaciones en la interfaz de usuario.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let extractedMessage = 'Ocurrió un error inesperado al procesar la solicitud.';

      if (error && error.error) {
        if (typeof error.error === 'object') {
          extractedMessage = error.error.message || error.error.error || extractedMessage;
        } else if (typeof error.error === 'string') {
          extractedMessage = error.error;
        }
      }

      if (!error.error || (!error.error.message && !error.error.error)) {
        if (error.status === 0) {
          extractedMessage = 'No se pudo conectar con el servidor backend. Verifica que esté en ejecución.';
        } else if (error.status === 401) {
          extractedMessage = 'No autorizado. Credenciales inválidas o sesión expirada.';
        } else if (error.status === 403) {
          extractedMessage = 'No tienes permisos suficientes para realizar esta acción.';
        } else if (error.status === 404) {
          extractedMessage = 'El recurso solicitado no fue encontrado en el servidor.';
        }
      }

      console.error(`[HttpErrorInterceptor] Error status ${error.status}:`, extractedMessage);
      return throwError(() => error);
    })
  );
};
