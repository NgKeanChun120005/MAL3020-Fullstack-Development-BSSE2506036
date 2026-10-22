import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { authGuard, roleGuard } from './guards/auth.guard';


// Define the routes for the Angular application, including authentication and role-based guards.
export const routes: Routes = [
  { path: '', component: Home, canActivate: [authGuard] },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

// Admin route is protected by both authGuard and roleGuard to ensure only authenticated users with the 'admin' role can access it.
  { path: 'admin', canActivate: [authGuard, roleGuard('admin')], component: Home },
  
  //this is a catch-all route that redirects any undefined paths to the home page.
  { path: '**', redirectTo: '' }
];