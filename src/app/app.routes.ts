import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Ruta pública del Catálogo Digital
  {
    path: '',
    loadComponent: () => import('./components/catalog/catalog.component').then(m => m.CatalogComponent)
  },

  // Ruta de Autenticación / Login
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },

  // Módulo de Administración (Ruta protegida por AuthGuard con Layout Base)
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./components/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'productos',
        loadComponent: () => import('./components/admin/admin-productos/admin-productos.component').then(m => m.AdminProductosComponent)
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./components/admin/admin-pedidos/admin-pedidos.component').then(m => m.AdminPedidosComponent)
      }
    ]
  },

  // Comodín para redirigir rutas no encontradas
  {
    path: '**',
    redirectTo: ''
  }
];
