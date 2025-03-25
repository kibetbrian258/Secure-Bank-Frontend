// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './Guards/auth.guard';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'deposit',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'withdraw',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'transfer',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'search-transactions',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'transactions/:accountNumber',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  // Default routes
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
