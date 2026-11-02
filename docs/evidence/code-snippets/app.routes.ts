import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { Menu } from './pages/menu/menu';
import { AdminMenu } from './pages/admin-menu/admin-menu';
import { authGuard, roleGuard } from './guards/auth.guard';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { MyOrders } from './pages/my-orders/my-orders';
  

// Define the routes for the Angular application, including authentication and role-based guards.
export const routes: Routes = [
  { path: '', component: Home, canActivate: [authGuard] },
  { path: 'menu', component: Menu },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
 
  // All three of these have roleGuard('customer') because it's for customer only.
  //A kitchen staff shouldn't see a cart. An admin shouldn't either.
  { path: 'cart', canActivate: [authGuard, roleGuard('customer')], component: Cart },
  { path: 'checkout', canActivate: [authGuard, roleGuard('customer')], component: Checkout },
  { path: 'orders', canActivate: [authGuard, roleGuard('customer')], component: MyOrders },

  // Admin route is protected by both authGuard and roleGuard to ensure only authenticated users with the 'admin' role can access it.
  { path: 'admin', canActivate: [authGuard, roleGuard('admin')], component: Home },
  { path: 'admin/menu', canActivate: [authGuard, roleGuard('admin')], component: AdminMenu },

  //this is a catch-all route that redirects any undefined paths to the home page.
  { path: '**', redirectTo: '' }
];