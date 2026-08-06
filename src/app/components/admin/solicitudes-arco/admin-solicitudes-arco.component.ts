import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArcoService } from '../../../services/arco.service';
import { SolicitudArcoItem } from '../../../models/arco.model';

@Component({
  selector: 'app-admin-solicitudes-arco',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-solicitudes-arco.component.html',
  styleUrls: ['./admin-solicitudes-arco.component.css']
})
export class AdminSolicitudesArcoComponent implements OnInit {
  private readonly arcoService = inject(ArcoService);

  solicitudes: SolicitudArcoItem[] = [];
  filteredSolicitudes: SolicitudArcoItem[] = [];

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Filtros
  searchTerm: string = '';
  selectedTipo: string = 'TODOS';
  selectedEstado: string = 'TODOS';

  // Modal de detalle y respuesta
  selectedSolicitud: SolicitudArcoItem | null = null;
  modalEstado: string = 'Pendiente';
  modalRespuesta: string = '';
  isSaving: boolean = false;

  // Estadísticas rápidas
  totalPendientes: number = 0;
  totalProcesadas: number = 0;
  totalRechazadas: number = 0;

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.arcoService.getSolicitudes().subscribe({
      next: (data: any[]) => {
        this.solicitudes = (data || []).map((item: any) => ({
          ...item,
          folio: item.folio || item.folioUnico || `ARCO-${(item._id || '').slice(-6).toUpperCase()}`,
          nombreCompleto: item.nombreCompleto || item.nombre || item.titular || 'Sin nombre',
          email: item.email || item.correo || 'Sin correo',
          telefono: item.telefono || item.phone || '',
          tipo: item.tipo || item.tipoDerecho || 'ACCESO',
          estado: item.estado || 'Pendiente',
          detalleSolicitud: item.detalleSolicitud || item.descripcion || item.detalle || ''
        }));

        this.calcularEstadisticas();
        this.filtrarSolicitudes();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Error al cargar las solicitudes ARCO.';
        this.isLoading = false;
      }
    });
  }

  calcularEstadisticas(): void {
    this.totalPendientes = this.solicitudes.filter(s =>
      s.estado.toLowerCase() === 'pendiente' || s.estado.toLowerCase() === 'en proceso'
    ).length;

    this.totalProcesadas = this.solicitudes.filter(s =>
      s.estado.toLowerCase() === 'procesada'
    ).length;

    this.totalRechazadas = this.solicitudes.filter(s =>
      s.estado.toLowerCase() === 'rechazada'
    ).length;
  }

  filtrarSolicitudes(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredSolicitudes = this.solicitudes.filter(s => {
      const matchSearch = !term ||
        (s.folio && s.folio.toLowerCase().includes(term)) ||
        (s._id && s._id.toLowerCase().includes(term)) ||
        (s.nombreCompleto && s.nombreCompleto.toLowerCase().includes(term)) ||
        (s.email && s.email.toLowerCase().includes(term)) ||
        (s.telefono && s.telefono.includes(term)) ||
        (s.detalleSolicitud && s.detalleSolicitud.toLowerCase().includes(term));

      const matchTipo = this.selectedTipo === 'TODOS' ||
        s.tipo.toUpperCase() === this.selectedTipo.toUpperCase();

      const matchEstado = this.selectedEstado === 'TODOS' ||
        s.estado.toLowerCase() === this.selectedEstado.toLowerCase();

      return matchSearch && matchTipo && matchEstado;
    });
  }

  onSearchChange(): void {
    this.filtrarSolicitudes();
  }

  onTipoFilterChange(): void {
    this.filtrarSolicitudes();
  }

  onEstadoFilterChange(): void {
    this.filtrarSolicitudes();
  }

  abrirModalGestion(solicitud: SolicitudArcoItem): void {
    this.selectedSolicitud = { ...solicitud };
    this.modalEstado = solicitud.estado || 'Pendiente';
    this.modalRespuesta = solicitud.respuesta || '';
  }

  cerrarModal(): void {
    this.selectedSolicitud = null;
    this.modalEstado = 'Pendiente';
    this.modalRespuesta = '';
  }

  guardarGestion(): void {
    if (!this.selectedSolicitud) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      estado: this.modalEstado,
      respuesta: this.modalRespuesta
    };

    this.arcoService.actualizarSolicitud(this.selectedSolicitud._id, payload).subscribe({
      next: (updatedItem: any) => {
        const index = this.solicitudes.findIndex(s => s._id === updatedItem._id);
        if (index !== -1) {
          this.solicitudes[index] = {
            ...updatedItem,
            folio: updatedItem.folio || updatedItem.folioUnico || `ARCO-${(updatedItem._id || '').slice(-6).toUpperCase()}`,
            nombreCompleto: updatedItem.nombreCompleto || updatedItem.nombre || updatedItem.titular || 'Sin nombre',
            email: updatedItem.email || updatedItem.correo || 'Sin correo',
            telefono: updatedItem.telefono || updatedItem.phone || '',
            tipo: updatedItem.tipo || updatedItem.tipoDerecho || 'ACCESO',
            estado: updatedItem.estado || 'Pendiente',
            detalleSolicitud: updatedItem.detalleSolicitud || updatedItem.descripcion || updatedItem.detalle || ''
          };
        } else {
          this.cargarSolicitudes();
        }

        this.calcularEstadisticas();
        this.filtrarSolicitudes();

        this.successMessage = `Solicitud ${updatedItem.folio || updatedItem._id} actualizada correctamente.`;
        this.isSaving = false;
        this.cerrarModal();

        setTimeout(() => {
          this.successMessage = '';
        }, 4000);
      },
      error: (err) => {
        this.errorMessage = err.message || 'No se pudo guardar la gestión de la solicitud.';
        this.isSaving = false;
      }
    });
  }

  getFolioDisplay(solicitud: SolicitudArcoItem): string {
    return solicitud.folio || `ARCO-${solicitud._id?.slice(-6).toUpperCase()}`;
  }

  getTipoLabel(tipo: string): string {
    if (!tipo) return '';
    switch (tipo.toUpperCase()) {
      case 'ACCESO': return 'Acceso';
      case 'RECTIFICACION': return 'Rectificación';
      case 'CANCELACION': return 'Cancelación';
      case 'OPOSICION': return 'Oposición';
      default: return tipo;
    }
  }

  getTipoBadgeClass(tipo: string): string {
    switch (tipo?.toUpperCase()) {
      case 'ACCESO': return 'badge-tipo-acceso';
      case 'RECTIFICACION': return 'badge-tipo-rectificacion';
      case 'CANCELACION': return 'badge-tipo-cancelacion';
      case 'OPOSICION': return 'badge-tipo-oposicion';
      default: return 'badge-tipo-default';
    }
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'procesada': return 'badge-estado-procesada';
      case 'rechazada': return 'badge-estado-rechazada';
      case 'en proceso':
      case 'en_proceso': return 'badge-estado-proceso';
      case 'pendiente':
      default: return 'badge-estado-pendiente';
    }
  }
}