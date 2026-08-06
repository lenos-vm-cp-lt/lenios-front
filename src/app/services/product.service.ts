import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';
import { Product } from '../models/product.model';
import { ApiResponse } from '../models/api-response.model';

export interface BackendProduct {
  _id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen?: string;
  categoria: string;
  disponible?: boolean;
  stock?: number;
}

/**
 * Servicio encargado de la gestión integral de Productos (Catálogo e Inventario Admin).
 * Adapta la comunicación HTTP al DTO estándar de respuesta del backend:
 * { success: boolean, message: string, data: any }.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  /**
   * Mapea un producto del formato backend (Mongoose schema) al formato frontend (Product interface).
   */
  private mapToFrontend(item: BackendProduct): Product {
    return {
      id: item._id,
      _id: item._id,
      name: item.nombre,
      description: item.descripcion || '',
      price: item.precio,
      imageUrl: item.imagen || '',
      category: item.categoria || 'General',
      disponible: item.disponible !== undefined ? item.disponible : true,
      stock: item.stock !== undefined ? item.stock : 0
    };
  }

  /**
   * Obtiene la lista pública de productos (disponibles y con stock > 0).
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse<BackendProduct[]>>(this.apiUrl).pipe(
      map(response => {
        if (response && response.success && Array.isArray(response.data)) {
          return response.data.map(item => this.mapToFrontend(item));
        }
        return [];
      })
    );
  }

  /**
   * Obtiene la lista completa de productos para administración (sin filtros).
   */
  getProductsAdmin(): Observable<Product[]> {
    return this.http.get<ApiResponse<BackendProduct[]>>(`${this.apiUrl}/admin`).pipe(
      map(response => {
        if (response && response.success && Array.isArray(response.data)) {
          return response.data.map(item => this.mapToFrontend(item));
        }
        return [];
      })
    );
  }

  /**
   * Obtiene un producto por su ID.
   */
  getProductById(id: string | number): Observable<Product> {
    return this.http.get<ApiResponse<BackendProduct>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response && response.success) {
          return this.mapToFrontend(response.data);
        }
        throw new Error(response?.message || 'No se pudo obtener la información del producto.');
      })
    );
  }

  /**
   * Crea un nuevo producto incluyendo opcionalmente la subida de su imagen en FormData.
   */
  createProduct(productData: Partial<Product>, imageFile?: File | null): Observable<Product> {
    const formData = new FormData();

    // Mapeo frontend -> backend
    if (productData.name) formData.append('nombre', productData.name);
    if (productData.description !== undefined) formData.append('descripcion', productData.description);
    if (productData.price !== undefined) formData.append('precio', productData.price.toString());
    if (productData.category) formData.append('categoria', productData.category);
    if (productData.disponible !== undefined) formData.append('disponible', productData.disponible.toString());
    if (productData.stock !== undefined) formData.append('stock', productData.stock.toString());

    if (imageFile) {
      formData.append('imagen', imageFile, imageFile.name);
    }

    return this.http.post<ApiResponse<BackendProduct>>(this.apiUrl, formData).pipe(
      map(response => {
        if (response && response.success) {
          return this.mapToFrontend(response.data);
        }
        throw new Error(response?.message || 'No se pudo crear el producto.');
      })
    );
  }

  /**
   * Actualiza un producto existente incluyendo opcionalmente una nueva imagen en FormData.
   */
  updateProduct(id: string | number, productData: Partial<Product>, imageFile?: File | null): Observable<Product> {
    const formData = new FormData();

    // Mapeo frontend -> backend
    if (productData.name) formData.append('nombre', productData.name);
    if (productData.description !== undefined) formData.append('descripcion', productData.description);
    if (productData.price !== undefined) formData.append('precio', productData.price.toString());
    if (productData.category) formData.append('categoria', productData.category);
    if (productData.disponible !== undefined) formData.append('disponible', productData.disponible.toString());
    if (productData.stock !== undefined) formData.append('stock', productData.stock.toString());

    if (imageFile) {
      formData.append('imagen', imageFile, imageFile.name);
    }

    return this.http.put<ApiResponse<BackendProduct>>(`${this.apiUrl}/${id}`, formData).pipe(
      map(response => {
        if (response && response.success) {
          return this.mapToFrontend(response.data);
        }
        throw new Error(response?.message || 'No se pudo actualizar el producto.');
      })
    );
  }

  /**
   * Alterna la disponibilidad de un producto existente.
   */
  toggleAvailability(id: string | number, disponible: boolean): Observable<Product> {
    return this.http.put<ApiResponse<BackendProduct>>(`${this.apiUrl}/${id}`, { disponible }).pipe(
      map(response => {
        if (response && response.success) {
          return this.mapToFrontend(response.data);
        }
        throw new Error(response?.message || 'No se pudo cambiar la disponibilidad del producto.');
      })
    );
  }

  /**
   * Elimina un producto por su ID.
   */
  deleteProduct(id: string | number): Observable<boolean> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        return !!(response && response.success);
      })
    );
  }
}
