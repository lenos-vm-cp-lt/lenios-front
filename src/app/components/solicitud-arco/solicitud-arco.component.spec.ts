import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolicitudArcoComponent } from './solicitud-arco.component';
import { ArcoService } from '../../services/arco.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SolicitudArcoResponse } from '../../models/arco.model';

describe('SolicitudArcoComponent', () => {
  let component: SolicitudArcoComponent;
  let fixture: ComponentFixture<SolicitudArcoComponent>;
  let arcoServiceSpy: jasmine.SpyObj<ArcoService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ArcoService', ['crearSolicitud']);

    await TestBed.configureTestingModule({
      imports: [SolicitudArcoComponent],
      providers: [
        { provide: ArcoService, useValue: spy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitudArcoComponent);
    component = fixture.componentInstance;
    arcoServiceSpy = TestBed.inject(ArcoService) as jasmine.SpyObj<ArcoService>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with an invalid form', () => {
    expect(component.arcoForm.valid).toBeFalse();
  });

  it('should validate required fields', () => {
    const form = component.arcoForm;
    expect(form.get('nombreCompleto')?.valid).toBeFalse();
    expect(form.get('email')?.valid).toBeFalse();
    expect(form.get('telefono')?.valid).toBeFalse();
    expect(form.get('tipoDerecho')?.valid).toBeFalse();
    expect(form.get('motivo')?.valid).toBeFalse();
  });

  it('should validate minLength for nombreCompleto (at least 3 characters)', () => {
    const control = component.arcoForm.get('nombreCompleto');
    control?.setValue('Ab');
    expect(control?.valid).toBeFalse();
    expect(control?.errors?.['minlength']).toBeTruthy();

    control?.setValue('Ana');
    expect(control?.errors?.['minlength']).toBeFalsy();
  });

  it('should validate email format', () => {
    const control = component.arcoForm.get('email');
    control?.setValue('invalid-email');
    expect(control?.valid).toBeFalse();

    control?.setValue('cliente@ejemplo.com');
    expect(control?.errors?.['email']).toBeFalsy();
  });

  it('should validate telefono pattern (exactly 10 digits)', () => {
    const control = component.arcoForm.get('telefono');
    
    // Con 9 dígitos -> inválido
    control?.setValue('551234567');
    expect(control?.valid).toBeFalse();
    expect(control?.errors?.['pattern']).toBeTruthy();

    // Con letras -> inválido
    control?.setValue('551234567a');
    expect(control?.valid).toBeFalse();

    // Con 10 dígitos -> válido
    control?.setValue('5512345678');
    expect(control?.valid).toBeTrue();
  });

  it('should validate minLength for motivo (at least 10 characters)', () => {
    const control = component.arcoForm.get('motivo');
    control?.setValue('Corto');
    expect(control?.valid).toBeFalse();

    control?.setValue('Motivo suficientemente explicativo para la solicitud.');
    expect(control?.valid).toBeTrue();
  });

  it('should mark all controls as touched if submitted with invalid form', () => {
    component.onSubmit();
    expect(component.arcoForm.touched).toBeTrue();
    expect(arcoServiceSpy.crearSolicitud).not.toHaveBeenCalled();
  });

  it('should call ArcoService and display success card with folio upon successful submission', () => {
    const mockResponse: SolicitudArcoResponse = {
      folio: 'ARCO-2026-123456',
      mensaje: 'Solicitud registrada correctamente.'
    };
    arcoServiceSpy.crearSolicitud.and.returnValue(of(mockResponse));

    component.arcoForm.setValue({
      nombreCompleto: 'Juan Pérez',
      email: 'juan@ejemplo.com',
      telefono: '5512345678',
      tipoDerecho: 'RECTIFICACION',
      motivo: 'Deseo actualizar mi número telefónico de contacto.'
    });

    component.onSubmit();

    expect(arcoServiceSpy.crearSolicitud).toHaveBeenCalledTimes(1);
    expect(component.respuestaExito).toBeTruthy();
    expect(component.respuestaExito?.folio).toBe('ARCO-2026-123456');

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.folio-number')?.textContent).toContain('ARCO-2026-123456');
  });

  it('should display error message when ArcoService fails', () => {
    arcoServiceSpy.crearSolicitud.and.returnValue(throwError(() => ({
      error: { mensaje: 'Error interno en el servidor' }
    })));

    component.arcoForm.setValue({
      nombreCompleto: 'Juan Pérez',
      email: 'juan@ejemplo.com',
      telefono: '5512345678',
      tipoDerecho: 'ACCESO',
      motivo: 'Deseo consultar la información recopilada.'
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Error interno en el servidor');
    expect(component.respuestaExito).toBeNull();
  });

  it('should reset form and state when calling nuevaSolicitud()', () => {
    component.respuestaExito = { folio: 'ARCO-2026-999' };
    component.nuevaSolicitud();

    expect(component.respuestaExito).toBeNull();
    expect(component.errorMessage).toBeNull();
    expect(component.arcoForm.get('nombreCompleto')?.value).toBe('');
  });
});
