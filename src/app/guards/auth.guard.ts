import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Guard funcional (CanActivateFn) para proteger las rutas del Módulo de Administración.
 * Verifica autenticación JWT y rol administrativo ('admin' o 'editor').
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (!authService.isAuthenticated()) {
    toastService.warning('Debes iniciar sesión con una cuenta administrativa.', 'Autenticación Requerida');
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  const user = authService.getUserInfo();
  const userRole = (user?.role || '').toLowerCase();
  const isAdminOrEditor = userRole === 'admin' || userRole === 'editor' || userRole === 'administrador';

  if (!isAdminOrEditor) {
    toastService.error('Tu cuenta no posee permisos de administrador para ingresar a esta sección.', 'Acceso Denegado');
    return router.createUrlTree(['/']);
  }

  return true;
};
