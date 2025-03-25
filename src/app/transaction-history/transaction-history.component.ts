// src/app/components/transactions/transaction-history/transaction-history.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

import { formatDate } from '@angular/common';
import { AccountResponse } from '../models/AccountResponse';
import { TransactionResponse } from '../models/TransactionResponse';
import { AccountService } from '../Services/account.service';
import { TransactionService } from '../Services/transaction.service';
import { TransactionSearchRequest } from '../models/TransactionSearchRequest';
import { PagedResponse } from '../models/PagedResponse';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css'],
})
export class TransactionHistoryComponent implements OnInit {
  accountNumber: string | null = null;
  account: AccountResponse | null = null;
  transactions: TransactionResponse[] = [];
  accounts: AccountResponse[] = [];
  loading = true;
  searching = false;
  error = '';
  searchForm!: FormGroup;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Display mode
  viewMode: 'recent' | 'search' = 'recent';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    // Initialize search form
    this.searchForm = this.formBuilder.group({
      accountNumber: [''],
      type: [''],
      startDate: [''],
      endDate: [''],
      minAmount: [''],
      maxAmount: [''],
    });

    // Get account number from route params
    this.route.paramMap.subscribe((params) => {
      this.accountNumber = params.get('accountNumber');

      if (this.accountNumber) {
        this.searchForm.patchValue({ accountNumber: this.accountNumber });
        this.loadAccountDetails();
      } else {
        this.loadAllAccounts();
      }
    });
  }

  // Load account details if account number is provided
  loadAccountDetails(): void {
    if (!this.accountNumber) return;

    this.accountService.getAccountDetails(this.accountNumber).subscribe({
      next: (account) => {
        this.account = account;
        this.loadRecentTransactions();
      },
      error: (error) => {
        this.error = 'Could not load account details. Please try again.';
        this.loading = false;
      },
    });
  }

  // Load all accounts for dropdown
  loadAllAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;

        // If account number wasn't in the URL but we have accounts, use the first one
        if (!this.accountNumber && accounts.length > 0) {
          this.accountNumber = accounts[0].accountNumber;
          this.searchForm.patchValue({ accountNumber: this.accountNumber });
          this.account = accounts[0];
        }

        this.loadRecentTransactions();
      },
      error: (error) => {
        this.error = 'Could not load accounts. Please try again.';
        this.loading = false;
      },
    });
  }

  // Load recent transactions
  loadRecentTransactions(): void {
    if (!this.accountNumber) {
      this.loading = false;
      return;
    }

    this.viewMode = 'recent';
    this.loading = true;

    this.transactionService
      .getRecentTransactions(this.accountNumber)
      .subscribe({
        next: (transactions) => {
          this.transactions = this.formatTransactions(transactions);
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Could not load transactions. Please try again.';
          this.loading = false;
        },
      });
  }

  // Search transactions with pagination
  searchTransactions(page: number = 0): void {
    this.viewMode = 'search';
    this.searching = true;
    this.currentPage = page;

    const searchRequest: TransactionSearchRequest = {
      accountNumber: this.searchForm.value.accountNumber || undefined,
      type: this.searchForm.value.type || undefined,
      startDate: this.searchForm.value.startDate || undefined,
      endDate: this.searchForm.value.endDate || undefined,
      minAmount: this.searchForm.value.minAmount
        ? parseFloat(this.searchForm.value.minAmount)
        : undefined,
      maxAmount: this.searchForm.value.maxAmount
        ? parseFloat(this.searchForm.value.maxAmount)
        : undefined,
    };

    this.transactionService
      .searchTransactionsPaginated(searchRequest, page, this.pageSize)
      .subscribe({
        next: (response: PagedResponse<TransactionResponse>) => {
          this.transactions = this.formatTransactions(response.content);
          this.totalItems = response.totalElements;
          this.totalPages = response.totalPages;
          this.currentPage = response.page;
          this.searching = false;
        },
        error: (error) => {
          this.error = 'Search failed. Please try again.';
          this.searching = false;
        },
      });
  }

  // Format transactions for display
  formatTransactions(
    transactions: TransactionResponse[]
  ): TransactionResponse[] {
    return transactions.map((transaction) => ({
      ...transaction,
      formattedAmount: this.formatCurrency(transaction.amount),
      formattedBalance: this.formatCurrency(
        transaction.balanceAfterTransaction
      ),
      formattedDateTime: this.formatDateTime(transaction.transactionDateTime),
    }));
  }

  // Handle search form submission
  onSearch(): void {
    this.searchTransactions(0); // Start at first page when performing a new search
  }

  // Reset search form
  resetSearch(): void {
    this.searchForm.reset();
    if (this.accountNumber) {
      this.searchForm.patchValue({ accountNumber: this.accountNumber });
    }
    this.loadRecentTransactions();
  }

  // Change page
  onPageChange(page: number): void {
    this.searchTransactions(page);
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

  // Helper to format date
  formatDateTime(dateTime: string | Date): string {
    if (!dateTime) return '';

    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    return formatDate(date, 'dd/MM/yy HH:mm', 'en-US');
  }

  // Navigate back to dashboard
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  // Check if search form has any values
  hasSearchValues(): boolean {
    const values = this.searchForm.value;
    return (
      values.type ||
      values.startDate ||
      values.endDate ||
      values.minAmount ||
      values.maxAmount
    );
  }
}
