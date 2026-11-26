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
    loadComponent: () => import('./auth/pages/panel/panel.page').then((m) => m.PanelPage),
  },
  { path: '**', redirectTo: 'auth/login' },
];
