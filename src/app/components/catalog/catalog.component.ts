import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_PRODUCTS } from '../../data/mock-products';
import { Product } from '../../models/product.model';
import { HomeCarouselComponent } from '../home-carousel/home-carousel.component';
import { ProductCardComponent } from '../product-card/product-card.component';

/**
 * Componente Standalone de la Vista Principal / Catálogo Digital de Leños Rellenos.
 * Coordina e integra el Carrusel Dinámico Superior y el Grid Responsivo de Productos.
 */
@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, HomeCarouselComponent, ProductCardComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent {
  /** Todos los productos del catálogo */
  products: Product[] = MOCK_PRODUCTS;

  /** Productos marcados como destacados para mostrar en el carrusel de la Home */
  featuredProducts: Product[] = MOCK_PRODUCTS.filter(p => p.featured);
}
