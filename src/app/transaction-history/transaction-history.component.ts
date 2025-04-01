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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    // Initialize search form with simplified fields
    this.searchForm = this.formBuilder.group({
      accountNumber: [''],
      type: [''],
      date: [''],
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
        console.error('Account details error:', error);
        this.error =
          error.error?.message ||
          'Could not load account details. Please try again.';
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
        console.error('Load accounts error:', error);
        this.error =
          error.error?.message || 'Could not load accounts. Please try again.';
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

    this.loading = true;
    this.error = '';

    this.transactionService
      .getRecentTransactions(this.accountNumber)
      .subscribe({
        next: (transactions) => {
          this.transactions = this.formatTransactions(transactions);
          this.loading = false;
        },
        error: (error) => {
          console.error('Load transactions error:', error);
          this.error =
            error.error?.message ||
            'Could not load transactions. Please try again.';
          this.loading = false;
        },
      });
  }

  // Search transactions with pagination - updated with proper date formatting
  searchTransactions(page: number = 0): void {
    this.searching = true;
    this.error = '';
    this.currentPage = page;

    // Create a date range if date is provided (for the whole day)
    let startDate: string | null = null;
    let endDate: string | null = null;

    if (this.searchForm.value.date) {
      try {
        // Set start date to beginning of the day
        const start = new Date(this.searchForm.value.date);
        start.setHours(0, 0, 0, 0);
        // Format date in the pattern that backend expects: yyyy-MM-dd'T'HH:mm:ss
        startDate = this.formatDateForBackend(start);

        // Set end date to end of the day
        const end = new Date(this.searchForm.value.date);
        end.setHours(23, 59, 59, 999);
        // Format date in the pattern that backend expects: yyyy-MM-dd'T'HH:mm:ss
        endDate = this.formatDateForBackend(end);

        console.log('Date range:', { startDate, endDate });
      } catch (error) {
        console.error('Error formatting date:', error);
        this.error = 'Invalid date format. Please select a valid date.';
        this.searching = false;
        return;
      }
    }

    // Only include non-empty values in the search request
    const searchRequest: TransactionSearchRequest = {};

    if (
      this.searchForm.value.accountNumber &&
      this.searchForm.value.accountNumber.trim() !== ''
    ) {
      searchRequest.accountNumber = this.searchForm.value.accountNumber;
    }

    if (
      this.searchForm.value.type &&
      this.searchForm.value.type.trim() !== ''
    ) {
      searchRequest.type = this.searchForm.value.type;
    }

    if (startDate) {
      searchRequest.startDate = startDate;
    }

    if (endDate) {
      searchRequest.endDate = endDate;
    }

    console.log('Sending search request:', JSON.stringify(searchRequest));

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
          console.error('Search error:', error);
          this.error =
            error.error?.message || 'Search failed. Please try again.';
          this.searching = false;
        },
      });
  }

  // Format date to match backend expected format: yyyy-MM-dd'T'HH:mm:ss
  private formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
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

  // Check if the search form has at least one valid search criteria
  isValidSearch(): boolean {
    const values = this.searchForm.value;
    return !!(
      (values.accountNumber && values.accountNumber.trim() !== '') ||
      (values.type && values.type.trim() !== '') ||
      values.date
    );
  }

  // Handle search form submission
  onSearch(): void {
    if (this.isValidSearch()) {
      this.searchTransactions(0); // Start at first page when performing a new search
    } else {
      // If no valid search criteria, load recent transactions instead
      this.loadRecentTransactions();
    }
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

  // Check if search form has any values - used for UI display
  hasSearchValues(): boolean {
    const values = this.searchForm.value;
    return !!(
      (values.accountNumber && values.accountNumber.trim() !== '') ||
      (values.type && values.type.trim() !== '') ||
      values.date
    );
  }
}