import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { FormularioProductoComponent } from './formulario-producto.component';

/**
 * Componente Standalone de gestión de Productos en el Módulo de Administración.
 */
@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, FormularioProductoComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Gestión de Productos</h1>
        <p class="page-subtitle">Administra el catálogo, precios, stock y disponibilidad de Leños Rellenos</p>
      </div>

      <!-- Alertas de estado -->
      @if (successMessage) {
        <div class="alert alert-success" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{{ successMessage }}</span>
        </div>
      }

      @if (errorMessage) {
        <div class="alert alert-danger" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      }

      <!-- Listado de Productos -->
      <div class="card table-card">
        <div class="table-header-row">
          <h2>Catálogo de Productos Activos</h2>
          <button class="btn btn-primary" (click)="openAddModal()" style="display: inline-flex; align-items: center; gap: 6px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Agregar Producto
          </button>
        </div>

        <!-- Barra de búsqueda y filtros -->
        <div class="filter-row">
          <div class="search-box">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Buscar por nombre o descripción..." 
              class="form-control search-input" />
          </div>
          <div class="select-filters">
            <select [(ngModel)]="selectedCategory" class="form-control select-input">
              <option value="">Todas las categorías</option>
              <option value="Dulces">Dulces</option>
              <option value="Salados">Salados</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Especiales">Especiales</option>
            </select>

            <select [(ngModel)]="selectedStatus" class="form-control select-input">
              <option value="Todos">Todos los estados</option>
              <option value="Disponibles">Disponibles</option>
              <option value="Agotados">Agotados/Inactivos</option>
            </select>
          </div>
        </div>
        
        @if (isLoading) {
          <div class="loading-state">
            <p>Cargando productos...</p>
          </div>
        } @else {
          @if (products.length === 0) {
            <div class="empty-state">
              <p>No se encontraron productos registrados.</p>
            </div>
          } @else {
            @if (filteredProducts.length === 0) {
              <div class="empty-state">
                <p>No se encontraron productos que coincidan con la búsqueda.</p>
              </div>
            } @else {
              <div class="table-responsive">
                <table class="products-table">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Disponibilidad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (prod of filteredProducts; track prod.id) {
                      <tr>
                        <td>
                          <img 
                            [src]="prod.imageUrl || 'assets/images/placeholder.webp'" 
                            [alt]="prod.name" 
                            class="thumb-img" 
                            (click)="openImageZoom(prod.imageUrl || 'assets/images/placeholder.webp', prod.name)"
                            title="Clic para ver en pantalla completa" />
                        </td>
                        <td><strong>{{ prod.name }}</strong></td>
                        <td><span class="badge-cat">{{ prod.category || 'General' }}</span></td>
                        <td>\${{ prod.price.toFixed(2) }}</td>
                        <td>
                          <span class="stock-badge" [class.out-of-stock]="(prod.stock || 0) <= 0">
                            {{ prod.stock !== undefined ? prod.stock : 0 }} uds
                          </span>
                        </td>
                        <td>
                          <div class="switch-container">
                            <label class="switch">
                              <input 
                                type="checkbox" 
                                [checked]="prod.disponible !== false" 
                                (change)="onToggleAvailability(prod)"
                                [disabled]="togglingProductId === prod.id" />
                              <span class="slider round"></span>
                            </label>
                            <span class="status-label" [class.inactive]="prod.disponible === false">
                              {{ prod.disponible !== false ? 'Activo' : 'Inactivo' }}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div class="action-buttons">
                            <button class="btn-sm btn-edit" (click)="openEditModal(prod)">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                              <span>Editar</span>
                            </button>
                            <button class="btn-sm btn-delete" (click)="deleteProduct(prod.id)">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          }
        }
      </div>
    </div>

    <!-- Modal de Formulario -->
    <app-formulario-producto
      [isOpen]="isModalOpen"
      [product]="selectedProduct"
      [isSubmitting]="isSubmitting"
      (closeModal)="closeModal()"
      (save)="saveProduct($event)">
    </app-formulario-producto>

    <!-- Lightbox Modal de Imagen Completa -->
    @if (zoomImageUrl) {
      <div class="lightbox-overlay" (click)="zoomImageUrl = null" tabindex="0" (keydown.escape)="zoomImageUrl = null">
        <div class="lightbox-card" (click)="$event.stopPropagation()">
          <button type="button" class="lightbox-close-btn" (click)="zoomImageUrl = null" title="Cerrar vista completa">&times;</button>
          <img [src]="zoomImageUrl" [alt]="zoomImageTitle" class="lightbox-img" />
          <div class="lightbox-caption">
            <strong>{{ zoomImageTitle }}</strong>
            <span>Vista completa en alta resolución</span>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-title { font-size: 1.8rem; font-weight: 700; color: var(--color-brown-darkest); }
    .page-subtitle { font-size: 0.95rem; color: var(--color-text-muted); }
    
    .alert { padding: 0.85rem 1.25rem; border-radius: var(--radius-md); font-weight: 500; font-size: 0.9rem; margin-bottom: 0.5rem; }
    .alert-success { background: #D1FAE5; border: 1px solid #10B981; color: #065F46; }
    .alert-danger { background: #FEE2E2; border: 1px solid #F87171; color: #991B1B; }
    
    .card { background: var(--color-bg-card); border-radius: var(--radius-lg); padding: 1.75rem; box-shadow: var(--shadow-sm); border: 1px solid var(--color-border-subtle); }
    
    .table-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      border-bottom: 2px solid var(--color-orange-subtle);
      padding-bottom: 0.5rem;
    }
    
    h2 { font-size: 1.2rem; color: var(--color-brown-dark); margin: 0; }

    /* Filter styles */
    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .search-box {
      flex: 1;
      min-width: 250px;
    }
    .select-filters {
      display: flex;
      gap: 0.75rem;
    }
    .form-control {
      padding: 0.65rem 0.85rem;
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.9rem;
      outline: none;
      background: #fff;
    }
    .search-input {
      width: 100%;
    }
    .select-input {
      min-width: 150px;
      cursor: pointer;
    }
    .form-control:focus {
      border-color: var(--color-orange-primary);
    }
    
    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }

    .products-table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
    .products-table th, .products-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--color-border-subtle); font-size: 0.9rem; vertical-align: middle; }
    .products-table th { background-color: var(--color-bg-cream); color: var(--color-brown-dark); font-weight: 700; }
    
    .thumb-img { width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius-sm); }
    .badge-cat { background: var(--color-orange-subtle); color: var(--color-orange-primary); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    
    .stock-badge {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      background: #E0F2FE;
      color: #0369A1;
    }
    .stock-badge.out-of-stock {
      background: #FEE2E2;
      color: #991B1B;
    }

    /* Toggle Switch styles */
    .switch-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .switch {
      position: relative;
      display: inline-block;
      width: 36px;
      height: 20px;
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
      height: 14px;
      width: 14px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .3s;
    }
    input:checked + .slider {
      background-color: #ea580c;
    }
    input:checked + .slider:before {
      transform: translateX(16px);
    }
    .slider.round {
      border-radius: 20px;
    }
    .slider.round:before {
      border-radius: 50%;
    }
    .status-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #16A34A;
    }
    .status-label.inactive {
      color: #DC2626;
    }

    .action-buttons { display: flex; gap: 0.5rem; }
    .btn-sm { padding: 0.35rem 0.65rem; border-radius: 4px; border: none; font-size: 0.8rem; cursor: pointer; font-weight: 500; }
    .btn-edit { background: #E0F2FE; color: #0369A1; }
    .btn-delete { background: #FEE2E2; color: #991B1B; }
    
    .btn { padding: 0.65rem 1.25rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; border: none; font-size: 0.9rem; }
    .btn-primary { background: var(--color-orange-primary); color: #fff; }
    .btn-primary:hover { background: var(--color-orange-bright); }

    .loading-state, .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
      color: var(--color-text-muted);
    }

    .thumb-img {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .thumb-img:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
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
export class GestionProductosComponent implements OnInit {
  private productService = inject(ProductService);

  products: Product[] = [];
  isLoading = false;
  isSubmitting = false;
  togglingProductId: string | number | null = null;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  isModalOpen = false;
  selectedProduct: Product | null = null;

  zoomImageUrl: string | null = null;
  zoomImageTitle = '';

  // Filtros
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = 'Todos';

  openImageZoom(url: string, title: string): void {
    this.zoomImageUrl = url;
    this.zoomImageTitle = title;
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  get filteredProducts(): Product[] {
    return this.products.filter(prod => {
      // Búsqueda por nombre o descripción
      const matchesSearch = 
        !this.searchQuery || 
        prod.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        prod.description.toLowerCase().includes(this.searchQuery.toLowerCase());

      // Filtro por categoría
      const matchesCategory = 
        !this.selectedCategory || 
        prod.category === this.selectedCategory;

      // Filtro por disponibilidad
      let matchesStatus = true;
      if (this.selectedStatus === 'Disponibles') {
        matchesStatus = prod.disponible !== false;
      } else if (this.selectedStatus === 'Agotados') {
        matchesStatus = prod.disponible === false;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.productService.getProductsAdmin().subscribe({
      next: (productsList) => {
        this.products = productsList;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar catálogo:', err);
        if (err.status === 403) {
          this.errorMessage = 'Acceso denegado (403): Tu cuenta no posee permisos de administrador (requiere rol admin o editor).';
        } else {
          this.errorMessage = err.message || 'Error al obtener la lista de productos.';
        }
        this.isLoading = false;
      }
    });
  }

  onToggleAvailability(product: Product): void {
    const nextState = product.disponible === false;
    this.togglingProductId = product.id;

    this.productService.toggleAvailability(product.id, nextState).subscribe({
      next: (updatedProduct) => {
        product.disponible = updatedProduct.disponible;
        this.togglingProductId = null;
        this.successMessage = `Disponibilidad de "${product.name}" actualizada a ${nextState ? 'activo' : 'inactivo'}.`;
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err: Error) => {
        console.error('Error al cambiar disponibilidad:', err);
        this.togglingProductId = null;
        this.errorMessage = err.message || 'No se pudo actualizar la disponibilidad.';
      }
    });
  }

  openAddModal(): void {
    this.selectedProduct = null;
    this.isModalOpen = true;
  }

  openEditModal(product: Product): void {
    this.selectedProduct = product;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedProduct = null;
  }

  saveProduct(event: { productData: Partial<Product>, imageFile: File | null }): void {
    this.isSubmitting = true;
    this.successMessage = null;
    this.errorMessage = null;

    if (this.selectedProduct) {
      // Edición
      this.productService.updateProduct(this.selectedProduct.id, event.productData, event.imageFile).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.isModalOpen = false;
          this.successMessage = 'Producto actualizado exitosamente.';
          this.loadProducts();
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        },
        error: (err: Error) => {
          this.isSubmitting = false;
          this.errorMessage = err.message || 'No se pudo actualizar el producto.';
        }
      });
    } else {
      // Creación
      this.productService.createProduct(event.productData, event.imageFile).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.isModalOpen = false;
          this.successMessage = 'Producto creado exitosamente.';
          this.loadProducts();
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        },
        error: (err: Error) => {
          this.isSubmitting = false;
          this.errorMessage = err.message || 'No se pudo crear el producto.';
        }
      });
    }
  }

  deleteProduct(id: string | number): void {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    this.successMessage = null;
    this.errorMessage = null;

    this.productService.deleteProduct(id).subscribe({
      next: (success) => {
        if (success) {
          this.successMessage = 'Producto eliminado correctamente.';
          this.loadProducts();
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        }
      },
      error: (err: Error) => {
        console.error(err);
        this.errorMessage = err.message || 'No se pudo eliminar el producto.';
      }
    });
  }
}
