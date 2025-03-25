import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './Guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { DepositComponent } from './deposit/deposit.component';
import { WithdrawComponent } from './withdraw/withdraw.component';
import { TransferComponent } from './transfer/transfer.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';

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
    component: DepositComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'withdraw',
    component: WithdrawComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'transfer',
    component: TransferComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'transactions',
    component: TransactionHistoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'transactions/:accountNumber',
    component: TransactionHistoryComponent,
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
