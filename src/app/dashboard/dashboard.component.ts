import { Component, OnInit, HostListener } from '@angular/core';
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
  customerName: string = '';
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
  loading = true;
  error = '';
  
  // Navigation tracking
  currentPage: string = 'dashboard';

  // Responsive design properties
  sidebarOpen: boolean = false;
  isMobileView: boolean = false;

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadUserData();
    
    // Check the current route to set the active nav item
    const currentUrl = this.router.url;
    if (currentUrl.includes('account-information')) {
      this.currentPage = 'account-information';
    }
  }

  // Load all user data
  loadUserData(): void {
    this.loading = true;

    // Fetch customer profile
    this.authService.getCustomerProfile().subscribe({
      next: (profile) => {
        this.customerName = profile.fullName;
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
          this.primaryAccount = accounts[0];
          this.accountSummary.accountNumber = this.primaryAccount.accountNumber;
          this.accountSummary.balance = this.formatCurrency(
            this.primaryAccount.balance
          );
          this.accountSummary.status = this.primaryAccount.status;

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

  // Check screen size on init and window resize
  @HostListener('window:resize', ['$event'])
  checkScreenSize(): void {
    this.isMobileView = window.innerWidth <= 768;
    if (!this.isMobileView) {
      this.sidebarOpen = false;
    }
  }

  // Toggle sidebar on mobile
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;

    // Prevent scrolling when sidebar is open
    if (this.sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // Close sidebar
  closeSidebar(): void {
    this.sidebarOpen = false;
    document.body.style.overflow = '';
  }
  
  // Navigation function
  navigateTo(page: string): void {
    this.currentPage = page;
    this.closeSidebar();
    
    switch (page) {
      case 'dashboard':
        this.router.navigate(['/dashboard']);
        break;
      case 'account-information':
        this.router.navigate(['/account-information']);
        break;
      case 'transactions':
        this.router.navigate(['/transactions']);
        break;
      case 'help':
        this.router.navigate(['/help']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }

  onDeposit(): void {
    // Handle deposit action
    this.router.navigate(['/deposit']);
    this.closeSidebar();
  }

  onWithdraw(): void {
    // Handle withdrawal action
    this.router.navigate(['/withdraw']);
    this.closeSidebar();
  }

  onTransfer(): void {
    // Handle transfer action
    this.router.navigate(['/transfer']);
    this.closeSidebar();
  }

  onSearch(): void {
    // Handle search action
    this.router.navigate(['/transactions']);
    this.closeSidebar();
  }

  viewAllTransactions(): void {
    // Handle view all transactions
    this.router.navigate(['/transactions', this.primaryAccount?.accountNumber]);
    this.closeSidebar();
  }

  logout(): void {
    // Handle logout
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeSidebar();
  }
}