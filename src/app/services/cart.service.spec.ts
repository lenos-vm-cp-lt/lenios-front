import { TestBed } from '@angular/core/testing';
import { CART_STORAGE_KEY, CartService } from './cart.service';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart-item.model';

describe('CartService', () => {
  let service: CartService;

  const mockProduct1: Product = {
    id: 1,
    name: 'Leño Dulce Tradicional',
    description: 'Relleno de arequipe artesanal y cobertura de chocolate',
    price: 19.99,
    imageUrl: 'assets/images/leno-dulce.webp',
    category: 'Dulce'
  };

  const mockProduct2: Product = {
    id: 'prod-2',
    name: 'Leño Salado Especial',
    description: 'Relleno de queso derretido y tocineta crocante',
    price: 15.50,
    imageUrl: 'assets/images/leno-salado.webp',
    category: 'Salado'
  };

  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba
    localStorage.removeItem(CART_STORAGE_KEY);

    TestBed.configureTestingModule({
      providers: [CartService]
    });
    service = TestBed.inject(CartService);
  });

  afterEach(() => {
    localStorage.removeItem(CART_STORAGE_KEY);
  });

  it('debe crearse exitosamente', () => {
    expect(service).toBeTruthy();
  });

  describe('Inicialización y Persistencia en localStorage', () => {
    it('debe inicializarse con un carrito vacío cuando localStorage no posee la clave lenios_cart', () => {
      expect(service.getItems().length).toBe(0);
      expect(service.getItemCount()).toBe(0);
      expect(service.getTotal()).toBe(0);
    });

    it('debe cargar los datos precargados desde localStorage en la inicialización', () => {
      const preloadedCart: CartItem[] = [
        { product: mockProduct1, quantity: 2 },
        { product: mockProduct2, quantity: 1 }
      ];
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(preloadedCart));

      // Re-crear la instancia del servicio para simular recarga de página
      const newServiceInstance = new CartService('browser' as unknown as object);
      expect(newServiceInstance.getItems().length).toBe(2);
      expect(newServiceInstance.getItemCount()).toBe(3);
      expect(newServiceInstance.getTotal()).toBe(55.48); // 19.99*2 + 15.50 = 39.98 + 15.50 = 55.48
    });

    it('debe manejar adecuadamente un JSON corrupto en localStorage reiniciando el carrito a vacío', () => {
      localStorage.setItem(CART_STORAGE_KEY, '{invalid_json}');
      const newServiceInstance = new CartService('browser' as unknown as object);
      expect(newServiceInstance.getItems()).toEqual([]);
      expect(newServiceInstance.getItemCount()).toBe(0);
    });
  });

  describe('Operaciones del Carrito: Agregar, Eliminar y Modificar', () => {
    it('debe agregar un nuevo producto al carrito correctamente', (done) => {
      service.addToCart(mockProduct1, 1);

      expect(service.getItems().length).toBe(1);
      expect(service.getItemCount()).toBe(1);
      expect(service.getTotal()).toBe(19.99);

      // Verificar actualización en localStorage
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      expect(stored).toBeTruthy();
      const parsed: CartItem[] = JSON.parse(stored!);
      expect(parsed.length).toBe(1);
      expect(parsed[0].product.id).toBe(mockProduct1.id);

      // Verificar emisión en cartItems$
      service.cartItems$.subscribe(items => {
        expect(items.length).toBe(1);
        done();
      });
    });

    it('debe incrementar la cantidad de un producto si este ya existía en el carrito', () => {
      service.addToCart(mockProduct1, 1);
      service.addToCart(mockProduct1, 2);

      const items = service.getItems();
      expect(items.length).toBe(1);
      expect(items[0].quantity).toBe(3);
      expect(service.getItemCount()).toBe(3);
    });

    it('debe eliminar un producto del carrito mediante removeFromCart', () => {
      service.addToCart(mockProduct1, 2);
      service.addToCart(mockProduct2, 1);
      expect(service.getItems().length).toBe(2);

      service.removeFromCart(mockProduct1.id);
      const remainingItems = service.getItems();

      expect(remainingItems.length).toBe(1);
      expect(remainingItems[0].product.id).toBe(mockProduct2.id);
      expect(service.getItemCount()).toBe(1);
    });

    it('debe actualizar la cantidad de un producto existente con updateQuantity', () => {
      service.addToCart(mockProduct1, 1);
      service.updateQuantity(mockProduct1.id, 5);

      const items = service.getItems();
      expect(items[0].quantity).toBe(5);
      expect(service.getItemCount()).toBe(5);
      expect(service.getTotal()).toBe(99.95);
    });

    it('debe eliminar el producto del carrito si updateQuantity recibe una cantidad <= 0', () => {
      service.addToCart(mockProduct1, 2);
      service.updateQuantity(mockProduct1.id, 0);

      expect(service.getItems().length).toBe(0);
      expect(service.getItemCount()).toBe(0);
    });

    it('debe vaciar completamente el carrito y remover la clave en localStorage al invocar clearCart', () => {
      service.addToCart(mockProduct1, 2);
      service.addToCart(mockProduct2, 3);
      expect(service.getItems().length).toBe(2);

      service.clearCart();

      expect(service.getItems().length).toBe(0);
      expect(service.getItemCount()).toBe(0);
      expect(service.getTotal()).toBe(0);
      expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
    });
  });

  describe('Cálculo del Total sin Errores de Redondeo Flotante', () => {
    it('debe calcular con precisión decimal los montos acumulados', () => {
      // 19.99 * 3 = 59.97
      // 15.50 * 2 = 31.00
      // Total = 90.97 (evitando imprecisiones como 90.97000000000001)
      service.addToCart(mockProduct1, 3);
      service.addToCart(mockProduct2, 2);

      expect(service.getTotal()).toBe(90.97);
    });

    it('debe manejar decimales complejos de precios sin imprecisión en los observables', (done) => {
      const precisionProduct: Product = {
        id: 99,
        name: 'Leño Gourmet',
        description: 'Edición especial',
        price: 10.14,
        imageUrl: ''
      };

      service.addToCart(precisionProduct, 3); // 10.14 * 3 = 30.42

      service.total$.subscribe(total => {
        expect(total).toBe(30.42);
        done();
      });
    });
  });
});