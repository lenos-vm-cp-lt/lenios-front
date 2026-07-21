import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Product } from '../../models/product.model';

/**
 * Componente Standalone que representa la tarjeta de un producto del catálogo.
 * Muestra la imagen del leño relleno, su nombre, descripción, precio y badge promocional.
 *
 * @example
 * <app-product-card [product]="myProductItem" />
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  /**
   * Objeto producto con la información detallada del leño relleno a renderizar.
   * Contiene nombre, descripción, precio, categoría, badge e imagen en formato WebP.
   */
  @Input({ required: true }) product!: Product;
}
