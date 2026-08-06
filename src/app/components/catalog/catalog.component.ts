import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';
import { HomeCarouselComponent } from '../home-carousel/home-carousel.component';
import { ProductCardComponent } from '../product-card/product-card.component';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { PrivacyModalComponent } from '../privacy-modal/privacy-modal.component';
import { ToastComponent } from '../toast/toast.component';

/**
 * Componente Standalone de la Vista Principal / Catálogo Digital de Leños Rellenos.
 * Coordina el Carrusel Dinámico, el Grid Responsivo, la barra de estado de Usuario,
 * comprobación inmediata del Aviso de Privacidad y notificaciones Toast globales.
 */
@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    HomeCarouselComponent,
    ProductCardComponent,
    OrderSummaryComponent,
    AuthModalComponent,
    PrivacyModalComponent,
    ToastComponent
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  readonly authService = inject(AuthService);

  /** Todos los productos del catálogo */
  products: Product[] = [];

  /** Productos marcados como destacados para mostrar en el carrusel de la Home */
  featuredProducts: Product[] = [];

  /** Controla la visibilidad del panel/drawer de Resumen de Pedido */
  isCartOpen = false;

  /** Controla el estado de carga de los productos */
  isLoading = false;

  showAuthModal = false;
  showPrivacyModal = false;
  showMandatoryPrivacyModal = false;

  /** Observable con el número total de unidades en el carrito */
  itemCount$: Observable<number>;

  constructor() {
    this.itemCount$ = this.cartService.itemCount$;
  }

  ngOnInit(): void {
    this.loadCatalog();
    this.checkPrivacyNotice();
  }

  /**
   * Comprueba si el usuario autenticado requiere aceptar de inmediato el Aviso de Privacidad.
   */
  checkPrivacyNotice(): void {
    if (this.authService.isAuthenticated() && !this.authService.hasAcceptedPrivacy()) {
      this.showMandatoryPrivacyModal = true;
    }
  }

  /**
   * Carga la lista de productos disponibles en el catálogo.
   */
  loadCatalog(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.featuredProducts = data.slice(0, 5);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar catálogo público:', err);
        this.isLoading = false;
      }
    });
  }

  openAuthModal(): void {
    this.showAuthModal = true;
  }

  closeAuthModal(): void {
    this.showAuthModal = false;
  }

  onAuthSuccess(): void {
    this.showAuthModal = false;
    this.checkPrivacyNotice();
  }

  onPrivacyAccepted(): void {
    this.showMandatoryPrivacyModal = false;
  }

  onPrivacyRejected(): void {
    this.showMandatoryPrivacyModal = false;
  }

  openPrivacyModal(): void {
    this.showPrivacyModal = true;
  }

  closePrivacyModal(): void {
    this.showPrivacyModal = false;
  }

  getUserInitials(): string {
    const user = this.authService.getUserInfo();
    if (!user || !user.name) return 'U';
    const names = user.name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.toastService.info('Has cerrado tu sesión correctamente. ¡Hasta pronto!', 'Sesión Finalizada');
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
