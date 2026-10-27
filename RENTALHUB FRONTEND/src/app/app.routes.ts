import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';

export const routes: Routes = [
  { path: '', title: 'RentalHub | Event equipment rental', loadComponent: () => import('./pages/home.page').then(m => m.HomePage) },
  { path: 'catalogue', title: 'Catalogue | RentalHub', loadComponent: () => import('./pages/catalogue.page').then(m => m.CataloguePage) },
  { path: 'catalogue/:id', title: 'Reserve | RentalHub', loadComponent: () => import('./pages/detail.page').then(m => m.DetailPage) },
  { path: 'sign-in', title: 'Sign in | RentalHub', loadComponent: () => import('./pages/auth.page').then(m => m.AuthPage), data: { mode: 'in' } },
  { path: 'sign-up', title: 'Register | RentalHub', loadComponent: () => import('./pages/auth.page').then(m => m.AuthPage), data: { mode: 'up' } },
  { path: 'checkout/:id', title: 'Payment | RentalHub', canActivate: [authGuard], loadComponent: () => import('./pages/checkout.page').then(m => m.CheckoutPage) },
  { path: 'my-bookings', title: 'My bookings | RentalHub', canActivate: [authGuard], loadComponent: () => import('./pages/bookings.page').then(m => m.BookingsPage) },
  { path: 'admin', title: 'Admin | RentalHub', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./pages/admin.page').then(m => m.AdminPage) },
  { path: '**', redirectTo: '' }
];
