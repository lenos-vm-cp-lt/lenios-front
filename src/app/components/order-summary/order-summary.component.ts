import { Component, OnInit, OnDestroy, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';
import { PedidoService, PedidoPayload, PedidoCreado, PedidoItem } from '../../services/pedido.service';

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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent implements OnInit, OnDestroy {
  /** Evento opcional para notificar la acción de continuar comprando o cerrar el modal/panel */
  @Output() closePanel = new EventEmitter<void>();

  /** Listado actual de los ítems en el carrito */
  cartItems: CartItem[] = [];

  /** Monto total acumulado */
  total = 0;

  /** Cantidad total de productos/unidades */
  itemCount = 0;

  /** Paso actual: 'cart' (carrito) o 'checkout' (formulario) */
  step: 'cart' | 'checkout' = 'cart';

  checkoutForm: FormGroup;
  isSubmitting = false;
  showPrivacyModal = false;

  private readonly pedidoService = inject(PedidoService);
  private readonly fb = inject(FormBuilder);

  /** Suscripciones activas para desuscripción limpia */
  private subscriptions: Subscription = new Subscription();

  constructor(public cartService: CartService) {
    this.checkoutForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      telefono: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$')]],
      metodoEntrega: ['A domicilio', Validators.required],
      ubicacion: ['', [Validators.required, Validators.maxLength(250)]],
      metodoPago: ['Efectivo', Validators.required],
      notas: ['', Validators.maxLength(500)],
      consentimiento: [false, [Validators.requiredTrue]]
    });
  }

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
        if (count === 0 && this.step === 'checkout') {
          this.step = 'cart';
        }
      })
    );

    // Lógica condicional según Método de Entrega
    this.subscriptions.add(
      this.checkoutForm.get('metodoEntrega')?.valueChanges.subscribe(metodo => {
        const ubicacionControl = this.checkoutForm.get('ubicacion');
        if (metodo === 'A domicilio') {
          ubicacionControl?.setValidators([Validators.required, Validators.maxLength(250)]);
          if (ubicacionControl?.value === 'Recoger en tienda (Sucursal)') {
            ubicacionControl?.setValue('');
          }
        } else {
          ubicacionControl?.clearValidators();
          ubicacionControl?.setValue('Recoger en tienda (Sucursal)');
        }
        ubicacionControl?.updateValueAndValidity();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Incrementa la cantidad de un ítem en 1 unidad.
   */
  incrementQuantity(productId: string | number, currentQuantity: number): void {
    this.cartService.updateQuantity(productId, currentQuantity + 1);
  }

  /**
   * Decrementa la cantidad de un ítem en 1 unidad. Si la cantidad llega a 0, se remueve.
   */
  decrementQuantity(productId: string | number, currentQuantity: number): void {
    this.cartService.updateQuantity(productId, currentQuantity - 1);
  }

  /**
   * Elimina un producto específico del carrito.
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
   * Avanza al paso de checkout
   */
  onGoToCheckout(): void {
    if (this.itemCount === 0) return;
    this.step = 'checkout';
  }

  /**
   * Regresa al paso del carrito
   */
  onBackToCart(): void {
    this.step = 'cart';
  }

  openPrivacyModal(): void {
    this.showPrivacyModal = true;
  }

  closePrivacyModal(): void {
    this.showPrivacyModal = false;
  }

  /**
   * Notifica el intento de procesar o confirmar la compra.
   */
  onSubmitOrder(): void {
    if (this.checkoutForm.invalid || this.itemCount === 0) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.checkoutForm.value;
    const metodoEntrega = formValue.metodoEntrega;
    const ubicacion = metodoEntrega === 'A domicilio'
      ? formValue.ubicacion
      : (formValue.ubicacion || 'Recoger en tienda (Sucursal)');

    const payload: PedidoPayload = {
      cliente: {
        nombre: formValue.nombre,
        telefono: formValue.telefono,
        ubicacion: ubicacion
      },
      productos_solicitados: this.cartItems.map(item => {
        const rawId = String(item.product._id || item.product.id || '');
        const isHex24 = /^[0-9a-fA-F]{24}$/.test(rawId);
        const objectId = isHex24 ? rawId : '60d5ecb8b5c9c22b1c8e1001';

        return {
          id_producto: objectId,
          cantidad: item.quantity,
          precio_unitario: item.product.price,
          nombre: item.product.name
        } as unknown as PedidoItem;
      }),
      total: this.total,
      metodoPago: formValue.metodoPago,
      metodoEntrega: metodoEntrega,
      notas: formValue.notas || '',
      consentimiento: formValue.consentimiento
    };

    this.pedidoService.crearPedido(payload).subscribe({
      next: (pedidoCreado) => {
        // En caso de que el backend no devuelva el nombre del producto, lo tomamos del payload original temporal.
        const pedidoParaWhatsApp = {
          ...pedidoCreado,
          productos_solicitados: payload.productos_solicitados
        };

        this.enviarAWhatsApp(pedidoParaWhatsApp as PedidoCreado);
        this.isSubmitting = false;
        this.onClose();
      },
      error: (err) => {
        console.error('Error al crear pedido', err);
        alert('Ocurrió un error al crear el pedido. Inténtalo de nuevo.');
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Función de utilidad para abrir el chat de WhatsApp
   */
  enviarAWhatsApp(pedidoCreado: PedidoCreado): void {
    const numeroNegocio = '524151013579'; // Número oficial de Leños Rellenos

    // Construcción del desglose de productos
    const listaProductos = pedidoCreado.productos_solicitados
      .map((item: PedidoItem & { nombre?: string, producto?: { nombre: string } }) => `• ${item.cantidad}x ${item.producto?.nombre || item.nombre || 'Leño'} ($${item.precio_unitario} c/u)`)
      .join('\n');

    // Formato del mensaje para WhatsApp
    const mensaje = `¡Hola Leños Rellenos! 🪵🔥
Acabo de realizar mi pedido desde la página web.

📌 *Orden ID:* #${pedidoCreado._id}
👤 *Cliente:* ${pedidoCreado.cliente.nombre}
📞 *Teléfono:* ${pedidoCreado.cliente.telefono}
📍 *Dirección:* ${pedidoCreado.cliente.ubicacion}

🛒 *Detalle del Pedido:*
${listaProductos}

💵 *Total:* $${pedidoCreado.total} MXN
💳 *Método de Pago:* ${pedidoCreado.metodoPago || 'Efectivo'}
📝 *Notas:* ${pedidoCreado.notas || 'Sin notas'}

¡Quedo a la espera de su confirmación!`;

    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroNegocio}&text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
    this.cartService.clearCart();
  }

  /**
   * Emite el evento para cerrar el panel o modal del resumen de pedido.
   */
  onClose(): void {
    this.closePanel.emit();
  }
}
