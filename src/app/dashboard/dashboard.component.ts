import { Component, OnInit } from '@angular/core';
import { AuthService } from '../Services/auth.service';
import { AccountService } from '../Services/account.service';
import { TransactionService } from '../Services/transaction.service';
import { Router } from '@angular/router';
import { CustomerProfile } from '../models/CustomerProfile';
import { formatDate } from '@angular/common';
import { TransactionResponse } from '../models/TransactionResponse';
import { AccountResponse } from '../models/AccountResponse';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  accountSummary = {
    customerId: '',
    accountNumber: '',
    balance: '',
    lastLogin: '',
    status: '',
  };

  transactions: TransactionResponse[] = [];
  accounts: AccountResponse[] = [];
  primaryAccount: AccountResponse | null = null;
  selectedAccountIndex: number = 0;
  loading = true;
  error = '';

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  // Load all user data
  loadUserData(): void {
    this.loading = true;

    // Fetch customer profile
    this.authService.getCustomerProfile().subscribe({
      next: (profile) => {
        this.accountSummary.customerId = profile.customerId;

        // Handle lastLogin regardless of whether it's a string or Date
        if (profile.lastLogin) {
          this.accountSummary.lastLogin = this.formatDateTime(
            profile.lastLogin
          );
        } else {
          this.accountSummary.lastLogin = 'Never logged in';
        }

        // After getting profile, fetch accounts
        this.loadAccounts();
      },
      error: (error) => {
        this.error = 'Could not load profile data';
        this.loading = false;
        console.error('Profile error:', error);
      },
    });
  }

  // Load customer accounts
  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;

        // Use the first account as primary if available
        if (accounts.length > 0) {
          this.selectedAccountIndex = 0;
          this.primaryAccount = accounts[this.selectedAccountIndex];
          this.updateAccountSummary();

          // Now load transactions for this account
          this.loadTransactions(this.primaryAccount.accountNumber);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = 'Could not load account data';
        this.loading = false;
        console.error('Accounts error:', error);
      },
    });
  }

  // Handle account selection change
  onAccountChange(): void {
    if (this.accounts.length > 0) {
      this.primaryAccount = this.accounts[this.selectedAccountIndex];
      this.updateAccountSummary();
      this.loadTransactions(this.primaryAccount.accountNumber);
    }
  }

  // Update account summary display
  updateAccountSummary(): void {
    if (this.primaryAccount) {
      this.accountSummary.accountNumber = this.primaryAccount.accountNumber;
      this.accountSummary.balance = this.formatCurrency(
        this.primaryAccount.balance
      );
      this.accountSummary.status = this.primaryAccount.status;
    }
  }

  // Load recent transactions
  loadTransactions(accountNumber: string): void {
    this.transactionService.getRecentTransactions(accountNumber).subscribe({
      next: (transactions) => {
        this.transactions = transactions.map((transaction) => ({
          ...transaction,
          // Format for display
          formattedAmount: this.formatCurrency(transaction.amount),
          formattedBalance: this.formatCurrency(
            transaction.balanceAfterTransaction
          ),
          formattedDateTime: this.formatDateTime(
            transaction.transactionDateTime
          ),
        }));
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Could not load transaction data';
        this.loading = false;
        console.error('Transactions error:', error);
      },
    });
  }

  // Helper to format currency
  formatCurrency(amount: number): string {
    return (
      'Ksh ' +
      amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  // Helper to format date - modified to accept both string and Date types
  formatDateTime(dateTime: string | Date): string {
    if (!dateTime) return '';

    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    return formatDate(date, 'dd/MM/yy HH:mm', 'en-US');
  }

  onDeposit(): void {
    this.router.navigate(['/deposit']);
  }

  onWithdraw(): void {
    this.router.navigate(['/withdraw']);
  }

  onTransfer(): void {
    this.router.navigate(['/transfer']);
  }

  onSearch(): void {
    this.router.navigate(['/transactions']);
  }

  viewAllTransactions(): void {
    if (this.primaryAccount) {
      this.router.navigate([
        '/transactions',
        this.primaryAccount.accountNumber,
      ]);
    }
  }
}
