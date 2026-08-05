import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';
import { HomeCarouselComponent } from '../home-carousel/home-carousel.component';
import { ProductCardComponent } from '../product-card/product-card.component';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { RouterLink } from '@angular/router';

/**
 * Componente Standalone de la Vista Principal / Catálogo Digital de Leños Rellenos.
 * Coordina e integra el Carrusel Dinámico Superior, el Grid Responsivo de Productos
 * y la barra flotante/panel interactivo de Resumen de Pedido (`order-summary`).
 */
@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, HomeCarouselComponent, ProductCardComponent, OrderSummaryComponent, RouterLink],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {
  private cartService = inject(CartService);
  private productService = inject(ProductService);

  /** Todos los productos del catálogo */
  products: Product[] = [];

  /** Productos marcados como destacados para mostrar en el carrusel de la Home */
  featuredProducts: Product[] = [];

  /** Controla la visibilidad del panel/drawer de Resumen de Pedido */
  isCartOpen = false;

  /** Controla el estado de carga de los productos */
  isLoading = false;

  /** Observable con el número total de unidades en el carrito */
  itemCount$: Observable<number>;

  constructor() {
    this.itemCount$ = this.cartService.itemCount$;
  }

  ngOnInit(): void {
    this.loadCatalog();
  }

  /**
   * Carga la lista de productos disponibles en el catálogo.
   */
  loadCatalog(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        // Tomamos los primeros 5 productos disponibles para mostrarlos en el carrusel
        this.featuredProducts = data.slice(0, 5);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar catálogo público:', err);
        this.isLoading = false;
      }
    });
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

  /**
   * Maneja el clic en el overlay del carrito para cerrarlo de forma accesible.
   */
  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('cart-drawer-overlay')) {
      this.closeCart();
    }
  }
}
