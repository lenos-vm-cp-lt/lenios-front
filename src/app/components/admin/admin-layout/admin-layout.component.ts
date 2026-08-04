import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

/**
 * Componente Standalone de Layout Base para el Módulo de Administración.
 * Proporciona un Navbar superior fijo, un Sidebar lateral dinámico con navegación protegida,
 * soporte responsivo para móviles y el contenedor principal `<router-outlet>`.
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  /** Estado de visibilidad del Sidebar en vistas móviles */
  isSidebarOpen = false;

  /** Obtiene la información del usuario autenticado */
  get user() {
    return this.authService.getUserInfo() || { name: 'Administrador', role: 'Superadmin', email: 'admin@lenios.com' };
  }

  /**
   * Alterna la apertura/cierre del Sidebar móvil.
   */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  /**
   * Cierra el Sidebar al seleccionar una opción en dispositivos móviles.
   */
  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  /**
   * Cierra la sesión del usuario y redirige al login.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
