import { Product } from '../models/product.model';

/**
 * Datos de prueba (Mock Data) de los Leños Rellenos para el catálogo digital.
 * Incluye variantes dulces y artesanales con imágenes optimizadas en formato WebP.
 */
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'leno-001',
    name: 'Leño Dulce de Leche y Nuez',
    description: 'Bizcocho artesanal esponjoso relleno de generoso dulce de leche reposado, trozos de nuez pecana tostada y cobertura de chocolate semi-amargo.',
    price: 18.50,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80&fm=webp',
    category: 'Dulces Clásicos',
    badge: 'Más Vendido',
    featured: true,
    rating: 4.9,
    prepTime: '25 min'
  },
  {
    id: 'leno-002',
    name: 'Leño Nutella & Fresas Silvestres',
    description: 'Fusión irresistible de avellana con cacao Nutella, mermelada artesanal de fresas silvestres y cubierta de virutas de chocolate con leche.',
    price: 21.00,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80&fm=webp',
    category: 'Especiales de la Casa',
    badge: 'Favorito',
    featured: true,
    rating: 5.0,
    prepTime: '30 min'
  },
  {
    id: 'leno-003',
    name: 'Leño Red Velvet & Queso Crema',
    description: 'Masa suave de terciopelo rojo impregnada con cacao fino, rellena de crema suave de queso mascarpone y toque de vainilla Bourbon.',
    price: 19.99,
    imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=800&q=80&fm=webp',
    category: 'Especiales de la Casa',
    badge: 'Nuevo',
    featured: true,
    rating: 4.8,
    prepTime: '20 min'
  },
  {
    id: 'leno-004',
    name: 'Leño Selva Negra Gourmand',
    description: 'Inspiración clásica germana con bizcocho humedecido en kirsch, relleno de cerezas amarenas glaseadas y chantilly cremosa.',
    price: 22.50,
    imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80&fm=webp',
    category: 'Gourmet',
    badge: 'Premium',
    featured: true,
    rating: 4.9,
    prepTime: '35 min'
  },
  {
    id: 'leno-005',
    name: 'Leño Moka Caramel Crunch',
    description: 'Masa de café espresso seleccionado relleno de mousse de caramelo salado, trocitos de toffee crocante y ganache de café.',
    price: 17.80,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80&fm=webp',
    category: 'Dulces Clásicos',
    badge: 'Recomendado',
    featured: false,
    rating: 4.7,
    prepTime: '15 min'
  },
  {
    id: 'leno-006',
    name: 'Leño Maracuyá & Chocolate Blanco',
    description: 'Equilibrio cítrico y dulce: bizcocho ligero de vainilla, cremoso de maracuyá fresco y baño brillante de chocolate blanco holandés.',
    price: 20.50,
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80&fm=webp',
    category: 'Frutales',
    badge: 'Temporada',
    featured: false,
    rating: 4.8,
    prepTime: '20 min'
  },
  {
    id: 'leno-007',
    name: 'Leño Pistacho & Frambuesa',
    description: 'Exquisito relleno de crema de pistachos sicilianos tostados, gel de frambuesas frescas y espolvoreado de pistacho picado.',
    price: 23.90,
    imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80&fm=webp',
    category: 'Gourmet',
    badge: 'Edición Limitada',
    featured: true,
    rating: 5.0,
    prepTime: '40 min'
  },
  {
    id: 'leno-008',
    name: 'Leño Manzana Canela & Almedras',
    description: 'Relleno de manzanas especiadas al horno con canela de Ceilán, pasas rubias y cubierta crujiente de almendras fileteadas.',
    price: 16.90,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80&fm=webp',
    category: 'Frutales',
    badge: 'Artesanal',
    featured: false,
    rating: 4.6,
    prepTime: '25 min'
  }
];
