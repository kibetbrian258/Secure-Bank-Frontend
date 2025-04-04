import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthInterceptor } from './Interceptors/auth.interceptor';
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
@NgModule({
  declarations: [AppComponent, RegisterComponent, HomeComponent, LoginComponent, DashboardComponent, DepositComponent, WithdrawComponent, TransferComponent, TransactionHistoryComponent, AccountInformationComponent, MainLayoutComponent, HelpSupportComponent, BankingGuideComponent, SecurityTipsComponent, TermsConditionsComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatIconModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
