import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./auth/pages/google-callback/google-callback.page').then((m) => m.GoogleCallbackPage),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./layouts/admin/admin').then((m) => m.AdminLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./auth/pages/panel/panel.page').then((m) => m.PanelPage),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./productos/pages/productos-access.page').then((m) => m.ProductosAccessPage),
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('./productos/pages/productos/productos.page').then((m) => m.ProductosPage),
          },
          {
            path: 'crear',
            loadComponent: () =>
              import('./productos/pages/crear-producto/crear-producto.page').then(
                (m) => m.CrearProductoPage,
              ),
          },
          {
            path: ':id/editar',
            loadComponent: () =>
              import('./productos/pages/editar-producto/editar-producto.page').then(
                (m) => m.EditarProductoPage,
              ),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
