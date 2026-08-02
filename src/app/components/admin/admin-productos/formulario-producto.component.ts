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
          <header class="modal-header">
            <h3>{{ product ? 'Editar Producto' : 'Crear Nuevo Producto' }}</h3>
            <button class="close-btn" (click)="onClose()" aria-label="Cerrar modal">&times;</button>
          </header>

          <form (ngSubmit)="onSubmit()" class="modal-form">
            <!-- Fila de Vista Previa de Imagen -->
            <div class="preview-row">
              <div class="image-preview-container">
                <span class="preview-label">Vista Previa de Imagen</span>
                <div class="preview-box">
                  @if (imagePreviewUrl) {
                    <img [src]="imagePreviewUrl" alt="Vista previa del producto" class="preview-img" />
                  } @else {
                    <div class="placeholder-preview">
                      <span class="preview-icon">📷</span>
                      <span class="preview-text">Subir imagen</span>
                    </div>
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
                  placeholder="19.99" />
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
                <label for="modalProdImage">Imagen del Producto ('imagen')</label>
                <input 
                  id="modalProdImage" 
                  type="file" 
                  accept="image/*" 
                  (change)="onFileSelected($event)" 
                  class="form-control file-input" />
                @if (selectedFileName) {
                  <small class="file-info">Seleccionado: {{ selectedFileName }}</small>
                }
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
                  <span class="switch-text">{{ formData.disponible ? 'Disponible' : 'No Disponible' }}</span>
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

            <footer class="form-actions">
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
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      outline: none;
    }
    
    .modal-card {
      background: var(--color-bg-card, #fff);
      border-radius: var(--radius-lg, 12px);
      width: 90%;
      max-width: 600px;
      padding: 1.75rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      border: 1px solid var(--color-border-subtle, #e5e7eb);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      border-bottom: 2px solid var(--color-orange-subtle, #fed7aa);
      padding-bottom: 0.5rem;
    }
    .modal-header h3 {
      font-size: 1.25rem;
      color: var(--color-brown-dark, #431407);
      margin: 0;
    }
    .close-btn {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      color: var(--color-text-muted, #6b7280);
      cursor: pointer;
      line-height: 1;
    }
    
    /* Preview box style */
    .preview-row {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }
    .image-preview-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .preview-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-brown-dark, #431407);
    }
    .preview-box {
      width: 150px;
      height: 150px;
      border: 2px dashed var(--color-border-subtle, #e5e7eb);
      border-radius: var(--radius-md, 8px);
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      background: var(--color-bg-cream, #fffbeb);
      box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
    }
    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .placeholder-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      color: var(--color-text-muted, #6b7280);
    }
    .preview-icon {
      font-size: 2rem;
    }
    .preview-text {
      font-size: 0.75rem;
      font-weight: 500;
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
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
      font-weight: 600;
      color: var(--color-brown-dark, #431407);
    }
    .form-control {
      padding: 0.65rem 0.85rem;
      border: 1px solid var(--color-border-subtle, #e5e7eb);
      border-radius: var(--radius-md, 8px);
      font-size: 0.9rem;
      outline: none;
    }
    .form-control:focus {
      border-color: var(--color-orange-primary, #ea580c);
    }
    
    .file-input {
      padding: 0.4rem;
      background: var(--color-bg-cream, #fffbeb);
    }
    .file-info {
      font-size: 0.8rem;
      color: var(--color-orange-primary, #ea580c);
      font-weight: 500;
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
      width: 44px;
      height: 22px;
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
      background-color: #ccc;
      transition: .3s;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
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
      border-radius: 22px;
    }
    .slider.round:before {
      border-radius: 50%;
    }
    .switch-text {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--color-brown-dark, #431407);
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
      border-top: 1px solid var(--color-border-subtle, #e5e7eb);
      padding-top: 1rem;
    }
    
    .btn {
      padding: 0.65rem 1.25rem;
      border-radius: var(--radius-md, 8px);
      font-weight: 600;
      cursor: pointer;
      border: none;
      font-size: 0.9rem;
    }
    .btn-primary {
      background: var(--color-orange-primary, #ea580c);
      color: #fff;
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--color-orange-bright, #f97316);
    }
    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
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
