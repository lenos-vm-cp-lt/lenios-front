import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart-item.model';

/** Clave para guardar y recuperar los elementos del carrito en localStorage */
export const CART_STORAGE_KEY = 'lenios_cart';

/**
 * Servicio reactivo para la gestión integral del carrito de compras de Leños Rellenos.
 * Encapsula la lógica de agregar, modificar cantidades, eliminar productos,
 * cálculo de subtotales y totales sin errores de redondeo, y sincronización
 * automática con `localStorage` (`lenios_cart`).
 */
@Injectable({
  providedIn: 'root'
})
export class CartService {
  /** Subject privado que almacena y emite la lista actual de ítems del carrito */
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);

  /** Observable público con la lista de ítems del carrito */
  public cartItems$: Observable<CartItem[]> = this.itemsSubject.asObservable();

  /** Observable público que emite el precio total acumulado del carrito sin errores de flotante */
  public total$: Observable<number> = this.cartItems$.pipe(
    map(items => this.calculateTotal(items))
  );

  /** Observable público que emite el conteo total de unidades de productos en el carrito */
  public itemCount$: Observable<number> = this.cartItems$.pipe(
    map(items => this.calculateItemCount(items))
  );

  /** Indica si la ejecución está ocurriendo dentro del entorno del navegador */
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadInitialCart();
  }

  /**
   * Carga el estado inicial del carrito leyendo la clave `lenios_cart` desde `localStorage`.
   * Si no existe contenido previo o la lectura falla, inicializa con un arreglo vacío.
   */
  private loadInitialCart(): void {
    if (!this.isBrowser) return;

    try {
      const storedData = localStorage.getItem(CART_STORAGE_KEY);
      if (storedData) {
        const parsedItems: CartItem[] = JSON.parse(storedData);
        if (Array.isArray(parsedItems)) {
          this.itemsSubject.next(parsedItems);
          return;
        }
      }
    } catch (error) {
      console.error('Error al recuperar el carrito desde localStorage:', error);
    }
    this.itemsSubject.next([]);
  }

  /**
   * Sincroniza la lista de ítems actual con el `localStorage`.
   * @param items Arreglo de ítems del carrito a guardar.
   */
  private saveCart(items: CartItem[]): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error al guardar el carrito en localStorage:', error);
    }
  }

  /**
   * Emite el nuevo estado del carrito y actualiza la persistencia local.
   * @param items Nuevo arreglo de ítems del carrito.
   */
  private updateCartState(items: CartItem[]): void {
    this.itemsSubject.next(items);
    this.saveCart(items);
  }

  /**
   * Agrega un producto al carrito de compras con la cantidad especificada.
   * Si el producto ya se encuentra en el carrito, incrementa su cantidad actual.
   *
   * @param product Producto del catálogo a incorporar al carrito.
   * @param quantity Cantidad de unidades a agregar (por defecto es 1).
   */
  public addToCart(product: Product, quantity = 1): void {
    if (!product || quantity <= 0) return;

    const currentItems = [...this.itemsSubject.getValue()];
    const existingIndex = currentItems.findIndex(item => item.product.id === product.id);

    if (existingIndex > -1) {
      currentItems[existingIndex] = {
        ...currentItems[existingIndex],
        quantity: currentItems[existingIndex].quantity + quantity
      };
    } else {
      currentItems.push({ product, quantity });
    }

    this.updateCartState(currentItems);
  }

  /**
   * Elimina un producto específico del carrito a partir de su ID.
   *
   * @param productId Identificador único (string o number) del producto a remover.
   */
  public removeFromCart(productId: string | number): void {
    const currentItems = this.itemsSubject.getValue();
    const updatedItems = currentItems.filter(item => item.product.id !== productId);
    this.updateCartState(updatedItems);
  }

  /**
   * Actualiza la cantidad de unidades de un producto específico en el carrito.
   * Si la cantidad provista es igual o menor a 0, el producto es removido automáticamente.
   *
   * @param productId Identificador del producto a actualizar.
   * @param quantity Nueva cantidad de unidades deseada.
   */
  public updateQuantity(productId: string | number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = [...this.itemsSubject.getValue()];
    const index = currentItems.findIndex(item => item.product.id === productId);

    if (index > -1) {
      currentItems[index] = {
        ...currentItems[index],
        quantity
      };
      this.updateCartState(currentItems);
    }
  }

  /**
   * Vacía completamente el carrito de compras, removiendo los elementos del estado y de `localStorage`.
   */
  public clearCart(): void {
    this.updateCartState([]);
    if (this.isBrowser) {
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch (error) {
        console.error('Error al limpiar localStorage:', error);
      }
    }
  }

  /**
   * Obtiene el valor síncrono actual del total acumulado a pagar sin errores de precisión de punto flotante.
   *
   * @returns Monto total a pagar redondeado a 2 decimales.
   */
  public getTotal(): number {
    return this.calculateTotal(this.itemsSubject.getValue());
  }

  /**
   * Obtiene la cantidad síncrona total de ítems/unidades almacenados en el carrito.
   *
   * @returns Conteo total de unidades.
   */
  public getItemCount(): number {
    return this.calculateItemCount(this.itemsSubject.getValue());
  }

  /**
   * Obtiene la lista actual síncrona de los ítems del carrito.
   *
   * @returns Copia del arreglo de ítems del carrito.
   */
  public getItems(): CartItem[] {
    return [...this.itemsSubject.getValue()];
  }

  /**
   * Función auxiliar para calcular el precio total eliminando imprecisiones numéricas flotantes.
   * @param items Lista de ítems sobre los cuales calcular el total.
   */
  private calculateTotal(items: CartItem[]): number {
    const rawTotal = items.reduce((accum, item) => accum + (item.product.price * item.quantity), 0);
    return Math.round((rawTotal + Number.EPSILON) * 100) / 100;
  }

  /**
   * Función auxiliar para sumar el total de unidades de productos.
   * @param items Lista de ítems del carrito.
   */
  private calculateItemCount(items: CartItem[]): number {
    return items.reduce((accum, item) => accum + item.quantity, 0);
  }
}
