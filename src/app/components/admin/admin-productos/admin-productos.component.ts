import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

/**
 * Componente Standalone de gestión de Productos en el Módulo de Administración.
 * Soporta la creación/edición de productos con subida de archivos mediante FormData ('imagen').
 */
@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Gestión de Productos</h1>
        <p class="page-subtitle">Administra el catálogo, precios y subida de imágenes de Leños Rellenos</p>
      </div>

      <!-- Alertas de estado -->
      <div *ngIf="successMessage" class="alert alert-success" role="alert">
        <span>✅ {{ successMessage }}</span>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger" role="alert">
        <span>⚠️ {{ errorMessage }}</span>
      </div>

      <!-- Formulario para agregar / editar producto con subida de imágenes -->
      <div class="card form-card">
        <h2>{{ editingProductId ? 'Editar Producto' : 'Crear Nuevo Producto' }}</h2>
        <form (ngSubmit)="saveProduct()" class="product-form">
          <div class="form-row">
            <div class="form-group">
              <label for="productName">Nombre del Producto *</label>
              <input 
                id="productName" 
                type="text" 
                [(ngModel)]="formProduct.name" 
                name="name" 
                required 
                class="form-control" 
                placeholder="ej. Leño Tradicional Arequipe" />
            </div>

            <div class="form-group">
              <label for="productPrice">Precio ($) *</label>
              <input 
                id="productPrice" 
                type="number" 
                step="0.01" 
                [(ngModel)]="formProduct.price" 
                name="price" 
                required 
                class="form-control" 
                placeholder="19.99" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="productCategory">Categoría</label>
              <select id="productCategory" [(ngModel)]="formProduct.category" name="category" class="form-control">
                <option value="Dulce">Dulce</option>
                <option value="Salado">Salado</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Especiales">Especiales</option>
              </select>
            </div>

            <div class="form-group">
              <label for="productImage">Imagen del Producto ('imagen')</label>
              <input 
                id="productImage" 
                type="file" 
                accept="image/*" 
                (change)="onFileSelected($event)" 
                class="form-control file-input" />
              <small *ngIf="selectedFile" class="file-info">Archivo seleccionado: {{ selectedFile.name }}</small>
            </div>
          </div>

          <div class="form-group">
            <label for="productDesc">Descripción</label>
            <textarea 
              id="productDesc" 
              [(ngModel)]="formProduct.description" 
              name="description" 
              rows="3" 
              class="form-control" 
              placeholder="Descripción del plato y sus ingredientes..."></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">
              <span *ngIf="!isSubmitting">{{ editingProductId ? 'Actualizar Producto' : 'Guardar Producto' }}</span>
              <span *ngIf="isSubmitting">Guardando...</span>
            </button>

            <button type="button" *ngIf="editingProductId" class="btn btn-secondary" (click)="cancelEdit()">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Listado de Productos -->
      <div class="card table-card">
        <h2>Catálogo de Productos Activos</h2>
        
        <div *ngIf="isLoading" class="loading-state">
          <p>Cargando productos...</p>
        </div>

        <div *ngIf="!isLoading && products.length === 0" class="empty-state">
          <p>No se encontraron productos registrados.</p>
        </div>

        <table *ngIf="!isLoading && products.length > 0" class="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let prod of products">
              <td>#{{ prod.id }}</td>
              <td>
                <img [src]="prod.imageUrl || 'assets/images/placeholder.webp'" [alt]="prod.name" class="thumb-img" />
              </td>
              <td><strong>{{ prod.name }}</strong></td>
              <td><span class="badge">{{ prod.category || 'General' }}</span></td>
              <td>\${{ prod.price.toFixed(2) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-sm btn-edit" (click)="editProduct(prod)">✏️ Editar</button>
                  <button class="btn-sm btn-delete" (click)="deleteProduct(prod.id)">🗑️ Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-title { font-size: 1.8rem; font-weight: 700; color: var(--color-brown-darkest); }
    .page-subtitle { font-size: 0.95rem; color: var(--color-text-muted); }
    .alert { padding: 0.85rem 1.25rem; border-radius: var(--radius-md); font-weight: 500; font-size: 0.9rem; }
    .alert-success { background: #D1FAE5; border: 1px solid #10B981; color: #065F46; }
    .alert-danger { background: #FEE2E2; border: 1px solid #F87171; color: #991B1B; }
    .card { background: var(--color-bg-card); border-radius: var(--radius-lg); padding: 1.75rem; box-shadow: var(--shadow-sm); border: 1px solid var(--color-border-subtle); }
    h2 { font-size: 1.2rem; color: var(--color-brown-dark); margin-bottom: 1.25rem; border-bottom: 2px solid var(--color-orange-subtle); padding-bottom: 0.5rem; }
    .product-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--color-brown-dark); }
    .form-control { padding: 0.65rem 0.85rem; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); font-size: 0.9rem; outline: none; }
    .file-input { padding: 0.4rem; background: var(--color-bg-cream); }
    .file-info { font-size: 0.8rem; color: var(--color-orange-primary); font-weight: 500; }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
    .btn { padding: 0.65rem 1.25rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; border: none; font-size: 0.9rem; }
    .btn-primary { background: var(--color-orange-primary); color: #fff; }
    .btn-primary:hover:not(:disabled) { background: var(--color-orange-bright); }
    .btn-secondary { background: #E5E7EB; color: #374151; }
    .products-table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
    .products-table th, .products-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--color-border-subtle); font-size: 0.9rem; }
    .products-table th { background-color: var(--color-bg-cream); color: var(--color-brown-dark); font-weight: 700; }
    .thumb-img { width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius-sm); }
    .badge { background: var(--color-orange-subtle); color: var(--color-orange-primary); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .action-buttons { display: flex; gap: 0.5rem; }
    .btn-sm { padding: 0.35rem 0.65rem; border-radius: 4px; border: none; font-size: 0.8rem; cursor: pointer; font-weight: 500; }
    .btn-edit { background: #E0F2FE; color: #0369A1; }
    .btn-delete { background: #FEE2E2; color: #991B1B; }
  `]
})
export class AdminProductosComponent implements OnInit {
  private productService = inject(ProductService);

  products: Product[] = [];
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  editingProductId: string | number | null = null;
  selectedFile: File | null = null;

  formProduct: Partial<Product> = {
    name: '',
    price: 0,
    category: 'Dulce',
    description: ''
  };

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.productService.getProducts().subscribe({
      next: (productsList) => {
        this.products = productsList;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar catálogo:', err);
        this.errorMessage = err?.error?.message || err?.error?.error || err?.message || 'Error al obtener la lista de productos.';
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  saveProduct(): void {
    if (!this.formProduct.name || !this.formProduct.price) {
      this.errorMessage = 'Por favor completa el nombre y precio del producto.';
      return;
    }

    this.isSubmitting = true;
    this.successMessage = null;
    this.errorMessage = null;

    if (this.editingProductId) {
      this.productService.updateProduct(this.editingProductId, this.formProduct, this.selectedFile).subscribe({
        next: (updatedProduct) => {
          this.isSubmitting = false;
          this.successMessage = 'Producto actualizado exitosamente.';
          this.resetForm();
          this.loadProducts();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err?.error?.message || err?.error?.error || err?.message || 'No se pudo actualizar el producto.';
        }
      });
    } else {
      this.productService.createProduct(this.formProduct, this.selectedFile).subscribe({
        next: (createdProduct) => {
          this.isSubmitting = false;
          this.successMessage = 'Producto creado exitosamente.';
          this.resetForm();
          this.loadProducts();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err?.error?.message || err?.error?.error || err?.message || 'No se pudo crear el producto.';
        }
      });
    }
  }

  editProduct(product: Product): void {
    this.editingProductId = product.id;
    this.formProduct = {
      name: product.name,
      price: product.price,
      category: product.category || 'Dulce',
      description: product.description || ''
    };
    this.selectedFile = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  deleteProduct(id: string | number): void {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    this.productService.deleteProduct(id).subscribe({
      next: (success) => {
        if (success) {
          this.successMessage = 'Producto eliminado correctamente.';
          this.loadProducts();
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || err?.error?.error || err?.message || 'No se pudo eliminar el producto.';
      }
    });
  }

  private resetForm(): void {
    this.editingProductId = null;
    this.selectedFile = null;
    this.formProduct = {
      name: '',
      price: 0,
      category: 'Dulce',
      description: ''
    };
  }
}
