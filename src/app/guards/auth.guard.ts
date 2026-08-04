import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional (CanActivateFn) para proteger las rutas del Módulo de Administración.
 * Si el usuario posee un token JWT válido, permite el acceso.
 * En caso contrario, redirige al usuario a la página de autenticación `/login`.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redireccionar al usuario a la página de login si no tiene un JWT válido
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
