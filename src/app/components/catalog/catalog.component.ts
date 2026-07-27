import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MOCK_PRODUCTS } from '../../data/mock-products';
import { Product } from '../../models/product.model';
import { HomeCarouselComponent } from '../home-carousel/home-carousel.component';
import { ProductCardComponent } from '../product-card/product-card.component';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import { CartService } from '../../services/cart.service';

/**
 * Componente Standalone de la Vista Principal / Catálogo Digital de Leños Rellenos.
 * Coordina e integra el Carrusel Dinámico Superior, el Grid Responsivo de Productos
 * y la barra flotante/panel interactivo de Resumen de Pedido (`order-summary`).
 */
@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, HomeCarouselComponent, ProductCardComponent, OrderSummaryComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent {
  /** Todos los productos del catálogo */
  products: Product[] = MOCK_PRODUCTS;

  /** Productos marcados como destacados para mostrar en el carrusel de la Home */
  featuredProducts: Product[] = MOCK_PRODUCTS.filter(p => p.featured);

  /** Controla la visibilidad del panel/drawer de Resumen de Pedido */
  isCartOpen: boolean = false;

  /** Observable con el número total de unidades en el carrito */
  itemCount$: Observable<number>;

  constructor(private cartService: CartService) {
    this.itemCount$ = this.cartService.itemCount$;
  }

  /**
   * Alterna la visibilidad del panel de resumen de pedido.
   */
  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
  }

  /**
   * Cierra el panel de resumen de pedido.
   */
  closeCart(): void {
    this.isCartOpen = false;
  }
}
