import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ArcoService } from './arco.service';
import { SolicitudArcoRequest, SolicitudArcoResponse } from '../models/arco.model';
import { ApiResponse } from '../models/api-response.model';

describe('ArcoService', () => {
  let service: ArcoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ArcoService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ArcoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a POST request to /api/derechos-arco with customer request data', () => {
    const mockRequest: SolicitudArcoRequest = {
      nombreCompleto: 'Juan Pérez',
      email: 'juan.perez@example.com',
      telefono: '5512345678',
      tipoDerecho: 'ACCESO',
      motivo: 'Deseo consultar todos los datos personales almacenados en la plataforma.'
    };

    const mockData: SolicitudArcoResponse = {
      folio: 'ARCO-2026-98765',
      mensaje: 'Solicitud registrada correctamente.',
      fechaRegistro: '2026-07-28T18:30:00Z'
    };

    const mockApiResponse: ApiResponse<SolicitudArcoResponse> = {
      success: true,
      message: 'Solicitud registrada correctamente.',
      data: mockData
    };

    service.crearSolicitud(mockRequest).subscribe((res) => {
      expect(res).toEqual(mockData);
      expect(res.folio).toBe('ARCO-2026-98765');
    });

    const req = httpMock.expectOne('/api/derechos-arco');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockApiResponse, { status: 201, statusText: 'Created' });
  });
});
