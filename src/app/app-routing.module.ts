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
import { AccountInformationComponent } from './account-information/account-information.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { HelpSupportComponent } from './help-support/help-support.component';
import { BankingGuideComponent } from './banking-guide/banking-guide.component';
import { SecurityTipsComponent } from './security-tips/security-tips.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';

const routes: Routes = [
  // Public routes (no auth required)
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Default redirect to home page
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Protected routes (auth required)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'deposit', component: DepositComponent },
      { path: 'withdraw', component: WithdrawComponent },
      { path: 'transfer', component: TransferComponent },
      { path: 'help', component: HelpSupportComponent },
      { path: 'banking-guide', component: BankingGuideComponent },
      { path: 'security-tips', component: SecurityTipsComponent },
      { path: 'terms-conditions', component: TermsConditionsComponent },
      { path: 'transactions', component: TransactionHistoryComponent },
      {
        path: 'transactions/:accountNumber',
        component: TransactionHistoryComponent,
      },
      { path: 'account-information', component: AccountInformationComponent },
    ],
  },

  // Catch all route
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
