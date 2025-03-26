import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerProfile } from '../models/CustomerProfile';
import { AccountResponse } from '../models/AccountResponse';
import { AuthService } from '../Services/auth.service';
import { AccountService } from '../Services/account.service';

@Component({
  selector: 'app-account-information',
  templateUrl: './account-information.component.html',
  styleUrls: ['./account-information.component.css'],
})
export class AccountInformationComponent implements OnInit {
  activeTab: 'account-details' | 'personal-information' = 'account-details';
  profile: CustomerProfile | null = null;
  accounts: AccountResponse[] = [];
  selectedAccount: AccountResponse | null = null;

  personalInfoForm!: FormGroup;
  newAccountForm!: FormGroup;

  // UI state
  loading = true;
  profileLoading = false;
  accountsLoading = false;
  editMode = false;
  error = '';
  success = '';
  showNewAccountForm = false;

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadData();

    // Check if there's a tab in the URL fragment
    const fragment = window.location.hash;
    if (fragment === '#personal-information') {
      this.activeTab = 'personal-information';
    }
  }

  initForms(): void {
    this.personalInfoForm = this.formBuilder.group({
      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.pattern('^[+]?[0-9]{10,15}$')],
      address: ['', Validators.maxLength(200)],
      dateOfBirth: [''],
    });

    this.newAccountForm = this.formBuilder.group({
      accountType: ['savings', Validators.required],
    });
  }

  loadData(): void {
    this.loading = true;
    this.profileLoading = true;
    this.accountsLoading = true;

    // Load customer profile
    this.authService.getCustomerProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.updatePersonalInfoForm();
        this.profileLoading = false;
        this.checkLoading();
      },
      error: (error) => {
        this.error = 'Could not load profile data';
        this.profileLoading = false;
        this.checkLoading();
      },
    });

    // Load accounts
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        if (accounts.length > 0) {
          this.selectedAccount = accounts[0];
        }
        this.accountsLoading = false;
        this.checkLoading();
      },
      error: (error) => {
        this.error = 'Could not load account data';
        this.accountsLoading = false;
        this.checkLoading();
      },
    });
  }

  checkLoading(): void {
    this.loading = this.profileLoading || this.accountsLoading;
  }

  updatePersonalInfoForm(): void {
    if (this.profile) {
      this.personalInfoForm.patchValue({
        fullName: this.profile.fullName,
        email: this.profile.email,
        phoneNumber: this.profile.phoneNumber,
        address: this.profile.address,
        // dateOfBirth: this.profile.dateOfBirth ? new Date(this.profile.dateOfBirth).toISOString().split('T')[0] : ''
      });
    }
  }

  onTabChange(tab: 'account-details' | 'personal-information'): void {
    this.activeTab = tab;
    // Update URL fragment without navigating
    window.location.hash = tab;
  }

  onSelectAccount(account: AccountResponse): void {
    this.selectedAccount = account;
  }

  onEditPersonalInfo(): void {
    this.editMode = true;
  }

  onSavePersonalInfo(): void {
    if (this.personalInfoForm.invalid) {
      return;
    }

    const updatedProfile = {
      ...this.profile,
      ...this.personalInfoForm.value,
    };

    // In a real application, you would call an API to update the profile
    // For this demo, we'll just update the local state
    this.profile = updatedProfile;
    this.editMode = false;
    this.success = 'Personal information updated successfully';
    setTimeout(() => (this.success = ''), 3000);
  }

  onCancelEdit(): void {
    this.updatePersonalInfoForm();
    this.editMode = false;
  }

  toggleNewAccountForm(): void {
    this.showNewAccountForm = !this.showNewAccountForm;
    if (!this.showNewAccountForm) {
      this.newAccountForm.reset();
      this.newAccountForm.patchValue({ accountType: 'savings' });
    }
  }

  onCreateNewAccount(): void {
    if (this.newAccountForm.invalid) {
      return;
    }

    const accountType = this.newAccountForm.value.accountType;

    // In a real application, you would call an API to create a new account
    // For this demo, we'll simulate creating a new account with dummy data
    const newAccountNumber =
      '47' + Math.floor(10000000000 + Math.random() * 90000000000);
    const newAccount: AccountResponse = {
      id: this.accounts.length + 1,
      accountNumber: newAccountNumber,
      customerId: this.profile?.customerId || '',
      balance: 0,
      status: 'Active',
      interestRate: accountType === 'savings' ? 2.5 : 0,
      branchName: 'Main Branch',
      branchCode: 'BR001',
      onlineBanking: true,
      mobileBanking: true,
      monthlyFee: accountType === 'checking' ? 5 : 0,
      minimumBalance: accountType === 'savings' ? 200 : 0,
      withdrawalLimit: 10000,
      transferLimit: 10000,
    };

    this.accounts.push(newAccount);
    this.selectedAccount = newAccount;
    this.showNewAccountForm = false;
    this.success = 'New account created successfully';
    setTimeout(() => (this.success = ''), 3000);
  }

  getAccountTypeName(account: AccountResponse): string {
    if (account.interestRate > 0 && account.minimumBalance > 0) {
      return 'Savings Account';
    } else {
      return 'Checking Account';
    }
  }

  formatCurrency(amount: number): string {
    return (
      'Ksh ' +
      amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
}
