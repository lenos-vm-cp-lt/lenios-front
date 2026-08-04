import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

/**
 * Componente Standalone que representa la tarjeta de un producto del catálogo.
 * Muestra la imagen del leño relleno, su nombre, descripción, precio, badge promocional
 * e integra la acción directa de "Agregar al carrito" con retroalimentación visual.
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  /** Objeto producto con la información detallada del leño relleno a renderizar */
  @Input({ required: true }) product!: Product;

  /** Estado para activación de animación/badge temporal de "Agregado" */
  isAdded = false;

  constructor(private cartService: CartService) {}

  /**
   * Dispara la agregación del producto al carrito mediante `CartService`.
   * @param event Evento de clic en el botón.
   */
  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(this.product, 1);

    this.isAdded = true;
    setTimeout(() => {
      this.isAdded = false;
    }, 1200);
  }
}
