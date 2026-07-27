import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';

/**
 * Componente Standalone de Resumen de Pedido (Order Summary).
 * Muestra el desglose detallado de los productos en el carrito (nombre, precio unitario,
 * cantidad, subtotal por ítem y el total general).
 * Permite modificar la cantidad, eliminar ítems, vaciar el carrito y avanzar hacia el pago.
 * Si el carrito está vacío, inhabilita la confirmación de la compra y muestra un mensaje claro.
 */
@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent implements OnInit, OnDestroy {
  /** Evento opcional para notificar la acción de continuar comprando o cerrar el modal/panel */
  @Output() closePanel = new EventEmitter<void>();

  /** Listado actual de los ítems en el carrito */
  cartItems: CartItem[] = [];

  /** Monto total acumulado */
  total: number = 0;

  /** Cantidad total de productos/unidades */
  itemCount: number = 0;

  /** Suscripciones activas para desuscripción limpia */
  private subscriptions: Subscription = new Subscription();

  constructor(public cartService: CartService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.cartService.cartItems$.subscribe(items => {
        this.cartItems = items;
      })
    );

    this.subscriptions.add(
      this.cartService.total$.subscribe(total => {
        this.total = total;
      })
    );

    this.subscriptions.add(
      this.cartService.itemCount$.subscribe(count => {
        this.itemCount = count;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Incrementa la cantidad de un ítem en 1 unidad.
   * @param productId ID del producto a incrementar.
   * @param currentQuantity Cantidad actual del producto.
   */
  incrementQuantity(productId: string | number, currentQuantity: number): void {
    this.cartService.updateQuantity(productId, currentQuantity + 1);
  }

  /**
   * Decrementa la cantidad de un ítem en 1 unidad. Si la cantidad llega a 0, se remueve.
   * @param productId ID del producto a decrementar.
   * @param currentQuantity Cantidad actual del producto.
   */
  decrementQuantity(productId: string | number, currentQuantity: number): void {
    this.cartService.updateQuantity(productId, currentQuantity - 1);
  }

  /**
   * Elimina un producto específico del carrito.
   * @param productId ID del producto a remover.
   */
  removeItem(productId: string | number): void {
    this.cartService.removeFromCart(productId);
  }

  /**
   * Vacía completamente todos los productos del carrito.
   */
  clearAll(): void {
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      this.cartService.clearCart();
    }
  }

  /**
   * Notifica el intento de procesar o confirmar la compra.
   */
  onCheckout(): void {
    if (this.itemCount === 0) return;
    alert(`¡Gracias por tu pedido! Has seleccionado ${this.itemCount} leño(s) por un total de $${this.total.toFixed(2)}.`);
  }

  /**
   * Emite el evento para cerrar el panel o modal del resumen de pedido.
   */
  onClose(): void {
    this.closePanel.emit();
  }
}
