import { Routes } from '@angular/router';
import { Home } from './home/home';
import { RouteDetail } from './route-detail/route-detail';
import { Login } from './login/login';
import { Admin } from './admin/admin';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'route/:number', component: RouteDetail },
  { path: 'login', component: Login },
  { path: 'admin', component: Admin },
];
