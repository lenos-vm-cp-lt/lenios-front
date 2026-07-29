import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudArcoRequest, SolicitudArcoResponse } from '../models/arco.model';

/**
 * Servicio encargado de gestionar las solicitudes de Derechos ARCO de los clientes,
 * conectándose con el backend a través de peticiones HTTP POST.
 */
@Injectable({
  providedIn: 'root'
})
export class ArcoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/derechos-arco';

  /**
   * Envía la solicitud de Derechos ARCO al servidor.
   * @param solicitud Datos del formulario completados por el cliente.
   * @returns Observable con la respuesta del servidor conteniendo el folio único de seguimiento.
   */
  crearSolicitud(solicitud: SolicitudArcoRequest): Observable<SolicitudArcoResponse> {
    return this.http.post<SolicitudArcoResponse>(this.apiUrl, solicitud);
  }
}
