import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models/product.model';
import { ApiResponse } from '../models/api-response.model';

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
  private readonly apiUrl = 'http://localhost:3000/api/v1/products';

  /**
   * Obtiene la lista completa de productos del catálogo.
   * Filtra y retorna únicamente si response.success es verdadero y extrae response.data.
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(this.apiUrl).pipe(
      map(response => {
        if (response && response.success && Array.isArray(response.data)) {
          return response.data;
        }
        return response?.data || [];
      })
    );
  }

  /**
   * Obtiene un producto por su ID.
   * Extrae response.data al evaluar response.success.
   */
  getProductById(id: string | number): Observable<Product> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        throw new Error(response?.message || 'No se pudo obtener la información del producto.');
      })
    );
  }

  /**
   * Crea un nuevo producto incluyendo opcionalmente la subida de su imagen en FormData.
   * Pasa el archivo en la propiedad 'imagen'.
   */
  createProduct(productData: Partial<Product>, imageFile?: File | null): Observable<Product> {
    const formData = new FormData();

    Object.keys(productData).forEach(key => {
      const value = (productData as any)[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    if (imageFile) {
      formData.append('imagen', imageFile, imageFile.name);
    }

    return this.http.post<ApiResponse<Product>>(this.apiUrl, formData).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        throw new Error(response?.message || 'No se pudo crear el producto.');
      })
    );
  }

  /**
   * Actualiza un producto existente incluyendo opcionalmente una nueva imagen en FormData ('imagen').
   */
  updateProduct(id: string | number, productData: Partial<Product>, imageFile?: File | null): Observable<Product> {
    const formData = new FormData();

    Object.keys(productData).forEach(key => {
      const value = (productData as any)[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    if (imageFile) {
      formData.append('imagen', imageFile, imageFile.name);
    }

    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, formData).pipe(
      map(response => {
        if (response && response.success) {
          return response.data;
        }
        throw new Error(response?.message || 'No se pudo actualizar el producto.');
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
