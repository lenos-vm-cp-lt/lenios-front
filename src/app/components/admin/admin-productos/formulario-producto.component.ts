import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-formulario-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="modal-overlay" (click)="onOverlayClick($event)" role="presentation" tabindex="-1">
        <div class="modal-card">
          <!-- Encabezado Fijo Genérico -->
          <header class="modal-header">
            <div class="header-title-box">
              <div class="header-badge-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </div>
              <div>
                <h3>{{ product ? 'Editar Producto' : 'Crear Nuevo Producto' }}</h3>
                <span class="header-sub">Actualiza los datos del menú artesanal</span>
              </div>
            </div>
            <button class="close-btn" (click)="onClose()" aria-label="Cerrar modal">&times;</button>
          </header>

          <form (ngSubmit)="onSubmit()" class="modal-form-wrapper">
            <!-- Cuerpo Desplazable (Únicamente el body scrollea) -->
            <div class="modal-body-scroll">
              <!-- Fila de Vista Previa de Imagen Interactiva -->
              <div class="preview-row">
                <div class="image-preview-container">
                  <span class="preview-label">Fotografía del Producto</span>
                  <div class="preview-box">
                    @if (imagePreviewUrl) {
                      <img [src]="imagePreviewUrl" alt="Vista previa del producto" class="preview-img" />
                      <div class="preview-overlay">
                        <button type="button" class="action-overlay-btn" (click)="openZoom($event)" title="Ver fotografía completa en alta resolución">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
                          </svg>
                          <span>Ver Completa</span>
                        </button>

                        <button type="button" class="action-overlay-btn" (click)="fileInput.click()" title="Seleccionar otra fotografía">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="4"></circle>
                          </svg>
                          <span>Cambiar Foto</span>
                        </button>
                      </div>
                    } @else {
                      <div class="placeholder-preview" (click)="fileInput.click()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="42" height="42" style="color: #ea580c;">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                        <span class="preview-text">Haz clic para cargar imagen</span>
                      </div>
                    }
                  </div>
                  <div class="preview-actions-bar">
                    @if (imagePreviewUrl) {
                      <button type="button" class="inline-preview-btn" (click)="openZoom($event)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
                        </svg>
                        <span>Ver en Pantalla Completa</span>
                      </button>
                    }
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="modalProdName">Nombre del Producto *</label>
                  <input 
                    id="modalProdName" 
                    type="text" 
                    [(ngModel)]="formData.name" 
                    name="name" 
                    required 
                    class="form-control" 
                    placeholder="ej. Leño Tradicional Arequipe" />
                </div>

                <div class="form-group">
                  <label for="modalProdPrice">Precio ($) *</label>
                  <input 
                    id="modalProdPrice" 
                    type="number" 
                    step="0.01" 
                    [(ngModel)]="formData.price" 
                    name="price" 
                    required 
                    class="form-control" 
                    placeholder="80.00" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="modalProdStock">Stock de Inventario *</label>
                  <input 
                    id="modalProdStock" 
                    type="number" 
                    [(ngModel)]="formData.stock" 
                    name="stock" 
                    required 
                    class="form-control" 
                    placeholder="10" />
                </div>

                <div class="form-group">
                  <label for="modalProdCategory">Categoría *</label>
                  <select id="modalProdCategory" [(ngModel)]="formData.category" name="category" class="form-control">
                    <option value="Dulces">Dulces</option>
                    <option value="Salados">Salados</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Especiales">Especiales</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="modalProdImage">Subir / Reemplazar Imagen</label>
                  <div class="custom-file-upload">
                    <button type="button" class="file-picker-btn" (click)="fileInput.click()">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span>{{ selectedFileName ? 'Cambiar Selección' : 'Seleccionar Archivo de Mi Equipo' }}</span>
                    </button>
                    <input 
                      #fileInput 
                      id="modalProdImage" 
                      type="file" 
                      accept="image/*" 
                      (change)="onFileSelected($event)" 
                      class="hidden-file-input" />
                  </div>
                </div>

                <div class="form-group toggle-group">
                  <label for="modalProdAvailable">Disponible para Venta</label>
                  <div class="switch-container">
                    <label class="switch">
                      <input 
                        id="modalProdAvailable" 
                        type="checkbox" 
                        [(ngModel)]="formData.disponible" 
                        name="disponible" />
                      <span class="slider round"></span>
                    </label>
                    <span class="switch-text" [class.active-text]="formData.disponible">
                      {{ formData.disponible ? 'Disponible' : 'No Disponible' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="modalProdDesc">Descripción</label>
                <textarea 
                  id="modalProdDesc" 
                  [(ngModel)]="formData.description" 
                  name="description" 
                  rows="3" 
                  class="form-control" 
                  placeholder="Descripción del plato y sus ingredientes..."></textarea>
              </div>
            </div>

            <!-- Footer Fijo Genérico -->
            <footer class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="onClose()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">
                {{ isSubmitting ? 'Guardando...' : (product ? 'Actualizar Producto' : 'Crear Producto') }}
              </button>
            </footer>
          </form>
        </div>
      </div>
    }

    <!-- Lightbox de Vista Completa de Imagen -->
    @if (isZoomOpen && imagePreviewUrl) {
      <div class="lightbox-overlay" (click)="isZoomOpen = false" tabindex="0" (keydown.escape)="isZoomOpen = false">
        <div class="lightbox-card" (click)="$event.stopPropagation()">
          <button type="button" class="lightbox-close-btn" (click)="isZoomOpen = false" title="Cerrar vista completa">&times;</button>
          <img [src]="imagePreviewUrl" [alt]="formData.name || 'Fotografía de Producto'" class="lightbox-img" />
          <div class="lightbox-caption">
            <strong>{{ formData.name || 'Fotografía del Producto' }}</strong>
            <span>Vista completa en alta resolución</span>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(18, 11, 7, 0.82);
      backdrop-filter: blur(10px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1100;
      padding: 1.25rem;
      animation: fadeInOverlay 0.25s ease-out;
    }

    @keyframes fadeInOverlay {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .modal-card {
      background: #ffffff;
      border-radius: 24px;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      border: 1px solid #f0e6df;
      overflow: hidden;
      animation: modalZoomIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalZoomIn {
      from {
        opacity: 0;
        transform: scale(0.92) translateY(15px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.75rem;
      border-bottom: 1px solid #f0e6df;
      flex-shrink: 0;
      background: #ffffff;
      z-index: 10;
    }

    .header-title-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-badge-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #ea580c, #c2410c);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 14px rgba(234, 88, 12, 0.3);
    }

    .modal-header h3 {
      font-size: 1.25rem;
      color: #3b281c;
      font-weight: 800;
      margin: 0;
    }

    .header-sub {
      font-size: 0.8rem;
      color: #7c685b;
    }

    .close-btn {
      background: #f3eae3;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 1.4rem;
      color: #6b5548;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #ea580c;
      color: #ffffff;
    }

    .modal-form-wrapper {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .modal-body-scroll {
      padding: 1.5rem 1.75rem;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }
    
    .preview-row {
      display: flex;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .image-preview-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .preview-label {
      font-size: 0.9rem;
      font-weight: 800;
      color: #3b281c;
    }

    .preview-box {
      position: relative;
      width: 260px;
      height: 190px;
      border: 2.5px dashed #ea580c;
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #faf4ef;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.07);
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .image-preview-container:hover .preview-box {
      border-color: #c2410c;
      box-shadow: 0 8px 20px rgba(234, 88, 12, 0.2);
    }

    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-overlay {
      position: absolute;
      inset: 0;
      background: rgba(18, 11, 7, 0.78);
      backdrop-filter: blur(3px);
      color: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      opacity: 0;
      transition: opacity 0.25s ease;
      border-radius: 18px;
      padding: 1rem;
    }

    .preview-box:hover .preview-overlay {
      opacity: 1;
    }

    .action-overlay-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.9rem;
      background: linear-gradient(135deg, #ea580c, #c2410c);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      transition: transform 0.15s;
    }

    .action-overlay-btn:hover {
      transform: scale(1.04);
    }

    .preview-actions-bar {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .inline-preview-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #faf4ef;
      color: #ea580c;
      border: 1px solid #f0e6df;
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .inline-preview-btn:hover {
      background: #ea580c;
      color: #ffffff;
      border-color: #ea580c;
    }

    .placeholder-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      color: #7c685b;
      padding: 1rem;
      text-align: center;
      cursor: pointer;
    }

    .preview-text {
      font-size: 0.82rem;
      font-weight: 700;
      color: #ea580c;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-group label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #4a382d;
    }

    .form-control {
      padding: 0.75rem 1rem;
      border: 1.5px solid #e7dcd3;
      border-radius: 12px;
      font-size: 0.92rem;
      outline: none;
      background: #faf7f4;
      transition: all 0.2s;
    }

    .form-control:focus {
      border-color: #ea580c;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.12);
    }
    
    .custom-file-upload {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.2rem;
    }

    .hidden-file-input {
      display: none;
    }

    .file-picker-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.7rem 1.25rem;
      background: #f3eae3;
      color: #ea580c;
      border: 1.5px solid #e7dcd3;
      border-radius: 12px;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .file-picker-btn:hover {
      background: #ea580c;
      color: #ffffff;
      border-color: #ea580c;
    }
    
    /* Toggle Switch */
    .toggle-group {
      justify-content: flex-end;
    }

    .switch-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 46px;
      height: 24px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #d1d5db;
      transition: .3s;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .3s;
    }

    input:checked + .slider {
      background-color: #ea580c;
    }

    input:checked + .slider:before {
      transform: translateX(22px);
    }

    .slider.round {
      border-radius: 24px;
    }

    .slider.round:before {
      border-radius: 50%;
    }

    .switch-text {
      font-size: 0.85rem;
      font-weight: 600;
      color: #7c685b;
    }

    .switch-text.active-text {
      color: #ea580c;
      font-weight: 700;
    }
    
    .modal-footer {
      padding: 1.25rem 1.75rem;
      border-top: 1px solid #f0e6df;
      background: #ffffff;
      flex-shrink: 0;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      z-index: 10;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      font-size: 0.92rem;
      transition: transform 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #ea580c, #c2410c);
      color: #fff;
      font-weight: 800;
      box-shadow: 0 6px 16px rgba(234, 88, 12, 0.35);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #f3eae3;
      color: #6b5548;
    }

    .btn-secondary:hover {
      background: #e7dcd3;
    }

    /* ─── Lightbox Modal Styles ─────────────────────────────────────────── */
    .lightbox-overlay {
      position: fixed;
      inset: 0;
      background: rgba(12, 7, 4, 0.92);
      backdrop-filter: blur(16px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 2rem;
      animation: fadeInOverlay 0.25s ease-out;
      outline: none;
    }

    .lightbox-card {
      position: relative;
      background: #2b1b0e;
      border-radius: 24px;
      padding: 1rem;
      max-width: 90vw;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(234, 88, 12, 0.3);
      animation: modalZoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .lightbox-close-btn {
      position: absolute;
      top: -16px;
      right: -16px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #ea580c;
      color: #ffffff;
      border: 2px solid #ffffff;
      font-size: 1.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(0,0,0,0.4);
      transition: transform 0.2s;
    }

    .lightbox-close-btn:hover {
      transform: scale(1.1);
    }

    .lightbox-img {
      max-width: 80vw;
      max-height: 70vh;
      object-fit: contain;
      border-radius: 16px;
    }

    .lightbox-caption {
      margin-top: 0.85rem;
      text-align: center;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .lightbox-caption strong {
      font-size: 1.1rem;
      color: #f97316;
    }

    .lightbox-caption span {
      font-size: 0.8rem;
      color: #d1d5db;
    }
  `]
})
export class FormularioProductoComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() product: Product | null = null;
  @Input() isSubmitting = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ productData: Partial<Product>, imageFile: File | null }>();

  formData: Partial<Product> = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'Dulces',
    disponible: true
  };

  selectedFile: File | null = null;
  selectedFileName = '';
  imagePreviewUrl: string | null = null;
  isZoomOpen = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      if (this.product) {
        this.formData = {
          name: this.product.name,
          description: this.product.description,
          price: this.product.price,
          stock: this.product.stock || 0,
          category: this.product.category || 'Dulces',
          disponible: this.product.disponible !== false
        };
        this.imagePreviewUrl = this.product.imageUrl || null;
      } else {
        this.formData = {
          name: '',
          description: '',
          price: 0,
          stock: 0,
          category: 'Dulces',
          disponible: true
        };
        this.imagePreviewUrl = null;
      }
      this.selectedFile = null;
      this.selectedFileName = '';
      this.isZoomOpen = false;
    }
  }

  openZoom(event: Event): void {
    event.stopPropagation();
    if (this.imagePreviewUrl) {
      this.isZoomOpen = true;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
      this.imagePreviewUrl = URL.createObjectURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.selectedFileName = '';
      this.imagePreviewUrl = this.product ? this.product.imageUrl || null : null;
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onClose();
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (!this.formData.name || this.formData.price === undefined || this.formData.stock === undefined) {
      return;
    }
    this.save.emit({
      productData: this.formData,
      imageFile: this.selectedFile
    });
  }
}
