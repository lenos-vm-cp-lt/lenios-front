import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';
import { SolicitudArcoRequest, SolicitudArcoResponse, SolicitudArcoItem } from '../models/arco.model';
import { ApiResponse } from '../models/api-response.model';

/**
 * Servicio encargado de gestionar las solicitudes de Derechos ARCO de los clientes,
 * conectándose con el backend a través de peticiones HTTP.
 */
@Injectable({
  providedIn: 'root'
})
export class ArcoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/derechos-arco`;

  /**
   * Envía la solicitud de Derechos ARCO al servidor.
   * Evalúa response.success y retorna la propiedad response.data con el folio único.
   * @param solicitud Datos del formulario completados por el cliente.
   * @returns Observable con la respuesta del servidor conteniendo el folio único de seguimiento.
   */
  crearSolicitud(solicitud: SolicitudArcoRequest): Observable<SolicitudArcoResponse> {
    return this.http.post<ApiResponse<SolicitudArcoResponse>>(this.apiUrl, solicitud).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        throw new Error(response?.message || 'No se pudo crear la solicitud ARCO.');
      })
    );
  }

  /**
   * Obtiene la lista completa de solicitudes ARCO registradas en la base de datos (MongoDB).
   */
  getSolicitudes(): Observable<SolicitudArcoItem[]> {
    return this.http.get<ApiResponse<SolicitudArcoItem[]>>(this.apiUrl).pipe(
      map(response => {
        if (response && response.success) {
          return response.data || [];
        }
        throw new Error(response?.message || 'No se pudieron obtener las solicitudes ARCO.');
      })
    );
  }

  /**
   * Actualiza el estado y/o la respuesta administrativa de una solicitud ARCO.
   * @param id ID de la solicitud en MongoDB.
   * @param data Datos a actualizar: estado y respuesta.
   */
  actualizarSolicitud(id: string, data: { estado?: string; respuesta?: string }): Observable<SolicitudArcoItem> {
    return this.http.patch<ApiResponse<SolicitudArcoItem>>(`${this.apiUrl}/${id}`, data).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        throw new Error(response?.message || 'No se pudo actualizar la solicitud ARCO.');
      })
    );
  }
}
