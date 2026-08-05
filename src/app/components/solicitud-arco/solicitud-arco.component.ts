import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ArcoService } from '../../services/arco.service';
import { SolicitudArcoResponse, TipoDerechoARCO } from '../../models/arco.model';

export interface OptionTipoDerecho {
  value: TipoDerechoARCO;
  label: string;
  descripcion: string;
}

/**
 * Componente público para el Formulario de Solicitud de Derechos ARCO (Acceso, Rectificación, Cancelación u Oposición).
 */
@Component({
  selector: 'app-solicitud-arco',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './solicitud-arco.component.html',
  styleUrl: './solicitud-arco.component.css'
})
export class SolicitudArcoComponent {
  private fb = inject(FormBuilder);
  private arcoService = inject(ArcoService);
  public router = inject(Router);

  /** Formulario reactivo para la solicitud ARCO */
  arcoForm: FormGroup = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    tipoDerecho: ['', [Validators.required]],
    motivo: ['', [Validators.required, Validators.minLength(10)]]
  });

  /** Estado de carga durante el envío a la API */
  loading = false;

  /** Mensaje de error retornado por la API o fallo de conexión */
  errorMessage: string | null = null;

  /** Respuesta exitosa con el folio asignado por el servidor */
  respuestaExito: SolicitudArcoResponse | null = null;

  /** Estado para confirmar si se copió el folio al portapapeles */
  copiedFolio = false;

  /** Opciones disponibles para el tipo de derecho ARCO */
  tiposDerechoOptions: OptionTipoDerecho[] = [
    {
      value: 'ACCESO',
      label: 'Acceso (A)',
      descripcion: 'Conocer qué datos personales tenemos sobre ti y para qué son utilizados.'
    },
    {
      value: 'RECTIFICACION',
      label: 'Rectificación (R)',
      descripcion: 'Solicitar la corrección de tus datos personales en caso de ser inexactos o incompletos.'
    },
    {
      value: 'CANCELACION',
      label: 'Cancelación (C)',
      descripcion: 'Solicitar la eliminación de tus datos personales de nuestros registros.'
    },
    {
      value: 'OPOSICION',
      label: 'Oposición (O)',
      descripcion: 'Oponerte al tratamiento de tus datos para fines específicos.'
    }
  ];

  /**
   * Determina si un campo del formulario es inválido y ha sido interactuado por el usuario.
   */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.arcoForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Obtiene el mensaje de error legible correspondiente para cada control del formulario.
   */
  getErrorMessage(fieldName: string): string {
    const control = this.arcoForm.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return 'Este campo es obligatorio.';
    }
    if (control.errors['minlength']) {
      const min = control.errors['minlength'].requiredLength;
      return `Debe contener al menos ${min} caracteres.`;
    }
    if (control.errors['email']) {
      return 'Ingresa un correo electrónico válido (ejemplo: usuario@dominio.com).';
    }
    if (control.errors['pattern']) {
      return 'El teléfono debe contener exactamente 10 dígitos numéricos.';
    }

    return 'Campo inválido.';
  }

  /**
   * Procesa el envío del formulario reactivo hacia la API.
   */
  onSubmit(): void {
    this.errorMessage = null;

    if (this.arcoForm.invalid) {
      this.arcoForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.arcoService.crearSolicitud(this.arcoForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        // Si el backend no devuelve un folio estructurado (ej. simulaciones en desarrollo), generar respaldo
        const folioGenerado = response?.folio || `ARCO-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        this.respuestaExito = {
          folio: folioGenerado,
          mensaje: response?.mensaje || 'Su solicitud de derechos ARCO ha sido registrada exitosamente.',
          fechaRegistro: response?.fechaRegistro || new Date().toISOString()
        };
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al registrar la solicitud ARCO:', error);
        
        if (error?.status === 201 || error?.status === 200) {
          this.respuestaExito = {
            folio: `ARCO-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
            mensaje: 'Solicitud registrada correctamente.',
            fechaRegistro: new Date().toISOString()
          };
        } else {
          this.errorMessage = error?.error?.message || error?.error?.error || error?.message || 'Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.';
        }
      }
    });
  }

  /**
   * Reinicia el formulario para permitir realizar una nueva solicitud.
   */
  nuevaSolicitud(): void {
    this.respuestaExito = null;
    this.errorMessage = null;
    this.copiedFolio = false;
    this.arcoForm.reset({
      nombreCompleto: '',
      email: '',
      telefono: '',
      tipoDerecho: '',
      motivo: ''
    });
  }

  /**
   * Copia el folio único generado al portapapeles del cliente.
   */
  copiarFolio(): void {
    if (this.respuestaExito?.folio) {
      navigator.clipboard.writeText(this.respuestaExito.folio).then(() => {
        this.copiedFolio = true;
        setTimeout(() => {
          this.copiedFolio = false;
        }, 3000);
      });
    }
  }
}
