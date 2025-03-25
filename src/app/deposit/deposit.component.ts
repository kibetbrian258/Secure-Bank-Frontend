import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountResponse } from '../models/AccountResponse';
import { TransactionService } from '../Services/transaction.service';
import { AccountService } from '../Services/account.service';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css'],
})
export class DepositComponent implements OnInit {
  depositForm!: FormGroup;
  accounts: AccountResponse[] = [];
  loading = false;
  submitted = false;
  success = false;
  error = '';
  loadingAccounts = true;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.depositForm = this.formBuilder.group({
      accountNumber: ['', Validators.required],
      amount: [
        '',
        [
          Validators.required,
          Validators.min(0.01),
          Validators.pattern(/^\d+(\.\d{1,2})?$/), // Allows numbers with up to 2 decimal places
        ],
      ],
    });

    // Load accounts
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.loadingAccounts = false;

        if (accounts.length === 1) {
          this.depositForm.patchValue({
            accountNumber: accounts[0].accountNumber,
          });
        }
      },
      error: (error) => {
        this.error = 'Could not load accounts. Please try again.';
        this.loadingAccounts = false;
      },
    });
  }

  get f() {
    return this.depositForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.depositForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const depositRequest = {
      accountNumber: this.f['accountNumber'].value,
      amount: parseFloat(this.f['amount'].value),
    };

    this.transactionService.deposit(depositRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = true;

        this.depositForm.reset();
        this.submitted = false;

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 3000);
      },
      error: (error) => {
        this.error =
          error.error.message ||
          error.error.error ||
          'Deposit failed. Please try again.';
        this.loading = false;
      },
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
