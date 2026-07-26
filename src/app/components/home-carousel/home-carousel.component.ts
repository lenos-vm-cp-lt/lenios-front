import { Component, Input, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { Product } from '../../models/product.model';

/**
 * Componente Standalone de Carrusel Dinámico para la página principal (Home).
 * Permite la navegación interactiva y automatizada entre las imágenes y datos de los leños destacados.
 *
 * @example
 * <app-home-carousel [items]="featuredProducts" [autoPlay]="true" [autoPlayInterval]="4000" />
 */
@Component({
  selector: 'app-home-carousel',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './home-carousel.component.html',
  styleUrl: './home-carousel.component.css'
})
export class HomeCarouselComponent implements OnInit, OnDestroy {
  /**
   * Lista de productos (leños rellenos) a mostrar en el carrusel principal.
   */
  @Input({ required: true }) items: Product[] = [];

  /**
   * Indica si la transición automática de diapositivas está activa.
   * Por defecto es `true`.
   */
  @Input() autoPlay: boolean = true;

  /**
   * Intervalo de tiempo en milisegundos entre cada diapositiva automática.
   * Por defecto es `5000` (5 segundos).
   */
  @Input() autoPlayInterval: number = 5000;

  /** Índice de la diapositiva visible actualmente */
  currentIndex: number = 0;

  /** Referencia al temporizador de reproducción automática */
  private timer: any = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && this.autoPlay) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  /**
   * Avanza a la siguiente diapositiva del carrusel.
   */
  nextSlide(): void {
    if (!this.items || this.items.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
  }

  /**
   * Retrocede a la diapositiva anterior del carrusel.
   */
  prevSlide(): void {
    if (!this.items || this.items.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
  }

  /**
   * Cambia directamente a la diapositiva indicada por su índice.
   * @param index Índice cero-basado de la diapositiva.
   */
  goToSlide(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
    }
  }

  /**
   * Inicia el temporizador de reproducción automática si está activado.
   */
  startAutoPlay(): void {
    this.stopAutoPlay();
    if (this.autoPlay && this.items && this.items.length > 1) {
      this.timer = setInterval(() => {
        this.nextSlide();
      }, this.autoPlayInterval);
    }
  }

  /**
   * Detiene el temporizador de reproducción automática.
   */
  stopAutoPlay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Manejador de evento al entrar el puntero del mouse sobre el carrusel (pausa).
   */
  onMouseEnter(): void {
    this.stopAutoPlay();
  }

  /**
   * Manejador de evento al salir el puntero del mouse del carrusel (reanuda).
   */
  onMouseLeave(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoPlay();
    }
  }
}
