import { Component, OnInit, OnDestroy, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';
import { PedidoService, PedidoPayload, PedidoCreado, PedidoItem } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { PrivacyModalComponent } from '../privacy-modal/privacy-modal.component';

/**
 * Componente Standalone de Resumen de Pedido (Order Summary).
 * Muestra el desglose detallado de los productos en el carrito (nombre, precio unitario,
 * cantidad, subtotal por ítem y el total general).
 * Exige autenticación del cliente y la aceptación previa del Aviso de Privacidad
 * antes de proceder a la creación del pedido.
 */
@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AuthModalComponent, PrivacyModalComponent],
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

  showAuthModal = false;
  showPrivacyModal = false;
  showMandatoryPrivacyModal = false;

  readonly authService = inject(AuthService);
  private readonly pedidoService = inject(PedidoService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  /** Suscripciones activas para desuscripción limpia */
  private subscriptions: Subscription = new Subscription();

  clabeCopied = false;

  constructor(public cartService: CartService) {
    this.checkoutForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      telefono: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$')]],
      metodoEntrega: ['A domicilio', Validators.required],
      ubicacion: ['', [Validators.required, Validators.maxLength(250)]],
      metodoPago: ['Efectivo', Validators.required],
      tarjetaNumero: [''],
      tarjetaExp: [''],
      tarjetaCvc: [''],
      tarjetaNombre: [''],
      cambioBilletes: [''],
      notas: ['', Validators.maxLength(500)]
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
          if (!ubicacionControl?.value || ubicacionControl?.value === 'Recoger en tienda (Sucursal)') {
            const user = this.authService.getUserInfo();
            ubicacionControl?.setValue(user?.ubicacion || (user as any)?.direccion || '');
          }
        } else {
          ubicacionControl?.clearValidators();
          ubicacionControl?.setValue('Recoger en tienda (Sucursal)');
        }
        ubicacionControl?.updateValueAndValidity();
      })
    );

    // Lógica condicional según Método de Pago (Validaciones de Tarjeta)
    this.subscriptions.add(
      this.checkoutForm.get('metodoPago')?.valueChanges.subscribe(metodo => {
        const numCtrl = this.checkoutForm.get('tarjetaNumero');
        const expCtrl = this.checkoutForm.get('tarjetaExp');
        const cvcCtrl = this.checkoutForm.get('tarjetaCvc');
        const nomCtrl = this.checkoutForm.get('tarjetaNombre');

        if (metodo === 'Tarjeta') {
          numCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9\\s]{15,19}$')]);
          expCtrl?.setValidators([Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\\/([0-9]{2})$')]);
          cvcCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{3,4}$')]);
          nomCtrl?.setValidators([Validators.required]);
        } else {
          numCtrl?.clearValidators();
          expCtrl?.clearValidators();
          cvcCtrl?.clearValidators();
          nomCtrl?.clearValidators();
        }
        numCtrl?.updateValueAndValidity();
        expCtrl?.updateValueAndValidity();
        cvcCtrl?.updateValueAndValidity();
        nomCtrl?.updateValueAndValidity();
      })
    );

    // Prellenar campos si el usuario ya está autenticado
    this.prefillUserData();
  }

  copyClabe(): void {
    navigator.clipboard.writeText('012320001234567890');
    this.clabeCopied = true;
    setTimeout(() => {
      this.clabeCopied = false;
    }, 2500);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get registeredAddress(): string {
    const user = this.authService.getUserInfo();
    if (!user) return '';
    return user.ubicacion || (user as any).direccion || (user as any).address || '';
  }

  useRegisteredAddress = true;

  onAddressModeChange(useRegistered: boolean): void {
    this.useRegisteredAddress = useRegistered;
    const regAddr = this.registeredAddress;

    if (useRegistered && regAddr) {
      this.checkoutForm.get('ubicacion')?.setValue(regAddr);
    } else if (!useRegistered) {
      if (this.checkoutForm.get('ubicacion')?.value === regAddr) {
        this.checkoutForm.get('ubicacion')?.setValue('');
      }
    }
  }

  private prefillUserData(): void {
    const user = this.authService.getUserInfo();
    if (user) {
      const regAddr = this.registeredAddress;
      const currentUbicacion = this.checkoutForm.get('ubicacion')?.value;

      if (regAddr) {
        this.useRegisteredAddress = true;
      } else {
        this.useRegisteredAddress = false;
      }

      this.checkoutForm.patchValue({
        nombre: this.checkoutForm.get('nombre')?.value || user.name || (user as any).nombre || '',
        telefono: this.checkoutForm.get('telefono')?.value || user.telefono || '',
        ubicacion: (currentUbicacion && currentUbicacion !== 'Recoger en tienda (Sucursal)') ? currentUbicacion : regAddr
      });
    }
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
   * Avanza al paso de checkout previa validación de inicio de sesión y aceptación de privacidad
   */
  onGoToCheckout(): void {
    if (this.itemCount === 0) return;

    if (!this.authService.isAuthenticated()) {
      this.showAuthModal = true;
      return;
    }

    if (!this.authService.hasAcceptedPrivacy()) {
      this.showMandatoryPrivacyModal = true;
      return;
    }

    this.prefillUserData();
    this.step = 'checkout';
  }

  /**
   * Manejador tras inicio de sesión o registro exitoso
   */
  onAuthSuccess(): void {
    this.showAuthModal = false;
    if (!this.authService.hasAcceptedPrivacy()) {
      this.showMandatoryPrivacyModal = true;
    } else {
      this.prefillUserData();
      this.step = 'checkout';
    }
  }

  /**
   * Manejador cuando el usuario acepta obligatoriamente el Aviso de Privacidad
   */
  onPrivacyAccepted(): void {
    this.showMandatoryPrivacyModal = false;
    this.prefillUserData();
    this.step = 'checkout';
  }

  /**
   * Manejador cuando el usuario rechaza el Aviso de Privacidad
   */
  onPrivacyRejected(): void {
    this.showMandatoryPrivacyModal = false;
    this.step = 'cart';
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
    if (!this.authService.isAuthenticated()) {
      this.showAuthModal = true;
      return;
    }

    if (!this.authService.hasAcceptedPrivacy()) {
      this.showMandatoryPrivacyModal = true;
      return;
    }

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

    let notasFinales = formValue.notas || '';
    if (formValue.metodoPago === 'Efectivo' && formValue.cambioBilletes) {
      notasFinales = `Paga con: ${formValue.cambioBilletes}${notasFinales ? ' | ' + notasFinales : ''}`;
    }

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
      notas: notasFinales,
      consentimiento: true
    };

    this.pedidoService.crearPedido(payload).subscribe({
      next: (pedidoCreado) => {
        const pedidoParaWhatsApp = {
          ...pedidoCreado,
          productos_solicitados: payload.productos_solicitados
        };

        this.enviarAWhatsApp(pedidoParaWhatsApp as PedidoCreado);
        this.isSubmitting = false;
        this.onClose();
      },
      error: (err: any) => {
        console.error('Error al crear pedido', err);
        const backendMessage = err.error?.message || err.error?.error || err.message || 'Ocurrió un error al crear el pedido. Inténtalo de nuevo.';
        if (err.status === 403) {
          this.toastService.warning(backendMessage || 'Debes aceptar el Aviso de Privacidad para confirmar tu pedido.', 'Aviso Requerido');
          this.showMandatoryPrivacyModal = true;
        } else if (err.status === 401) {
          this.toastService.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'Sesión Expirada');
          this.showAuthModal = true;
        } else {
          this.toastService.error(backendMessage, 'Error en Pedido');
        }
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Función de utilidad para abrir el chat de WhatsApp sanitizando y validando
   * expresamente la minimización de datos (Data Minimization) conforme a la LGPDPPSO.
   * Se transmiten única y exclusivamente los datos estrictamente indispensables de entrega sobre HTTPS.
   */
  enviarAWhatsApp(pedidoCreado: PedidoCreado): void {
    const payloadMinimo = this.validarYMinimizarPayloadWhatsApp(pedidoCreado);
    const numeroNegocio = '524151013579'; // Número oficial de Leños Rellenos

    const listaProductos = payloadMinimo.productos
      .map(item => `• ${item.cantidad}x ${item.nombre} ($${item.precio_unitario} c/u)`)
      .join('\n');

    const mensaje = `¡Hola Leños Rellenos!
Acabo de realizar mi pedido desde la página web.

*Orden ID:* #${payloadMinimo.orderId}
*Cliente:* ${payloadMinimo.clienteNombre}
*Teléfono:* ${payloadMinimo.clienteTelefono}
*Dirección:* ${payloadMinimo.clienteUbicacion}

*Detalle del Pedido:*
${listaProductos}

*Total:* $${payloadMinimo.total} MXN
*Método de Pago:* ${payloadMinimo.metodoPago}
*Notas:* ${payloadMinimo.notas}

¡Quedo a la espera de su confirmación!`;

    // Garantizar transmisión cifrada punto a punto mediante protocolo HTTPS/TLS sobre la API oficial de WhatsApp
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroNegocio}&text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
    this.cartService.clearCart();
  }

  /**
   * Valida y sanitiza el objeto de pedido para asegurar que únicamente se incluyan
   * los datos mínimos requeridos de entrega (Data Minimization) antes de la transferencia a WhatsApp (Meta).
   */
  private validarYMinimizarPayloadWhatsApp(pedido: PedidoCreado) {
    const orderId = String(pedido._id || '').trim();
    const clienteNombre = String(pedido.cliente?.nombre || 'Cliente').trim();
    const clienteTelefono = String(pedido.cliente?.telefono || '').trim();
    const clienteUbicacion = String(pedido.cliente?.ubicacion || 'Recoger en tienda').trim();
    const total = Number(pedido.total || 0);
    const metodoPago = String(pedido.metodoPago || 'Efectivo').trim();
    const notas = String(pedido.notas || 'Sin notas').trim();

    const productos = (pedido.productos_solicitados || []).map((item: any) => ({
      nombre: String(item.producto?.nombre || item.nombre || 'Leño').trim(),
      cantidad: Number(item.cantidad || 1),
      precio_unitario: Number(item.precio_unitario || 0)
    }));

    return {
      orderId,
      clienteNombre,
      clienteTelefono,
      clienteUbicacion,
      total,
      metodoPago,
      notas,
      productos
    };
  }

  /**
   * Emite el evento para cerrar el panel o modal del resumen de pedido.
   */
  onClose(): void {
    this.closePanel.emit();
  }
}
