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
        dateOfBirth: this.profile.dateOfBirth ? new Date(this.profile.dateOfBirth).toISOString().split('T')[0] : ''
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

    this.loading = true;
    this.error = '';
    this.success = '';

    // Extract only the changed fields to update
    const formValue = this.personalInfoForm.value;
    const updateData: Partial<CustomerProfile> = {};
    
    // Only include fields that have changed
    if (formValue.fullName !== this.profile?.fullName) {
      updateData.fullName = formValue.fullName;
    }
    
    if (formValue.email !== this.profile?.email) {
      updateData.email = formValue.email;
    }
    
    if (formValue.phoneNumber !== this.profile?.phoneNumber) {
      updateData.phoneNumber = formValue.phoneNumber;
    }
    
    if (formValue.address !== this.profile?.address) {
      updateData.address = formValue.address;
    }
    
    // Call the API to update the profile
    this.authService.updateCustomerProfile(updateData).subscribe({
      next: (updatedProfile) => {
        // Update the local profile data
        this.profile = updatedProfile;
        this.editMode = false;
        this.success = 'Personal information updated successfully';
        this.loading = false;
        
        // Clear the success message after 3 seconds
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (error) => {
        this.error = error.error?.message || 'Error updating profile. Please try again.';
        this.loading = false;
        
        // Clear the error message after 5 seconds
        setTimeout(() => (this.error = ''), 5000);
      }
    });
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
    this.loading = true;
    this.error = '';
    this.success = '';

    // Call the backend API to create the account
    this.accountService.createAccount(accountType).subscribe({
      next: (newAccount) => {
        // Add the new account to the accounts list
        this.accounts.push(newAccount);
        
        // Select the newly created account
        this.selectedAccount = newAccount;
        this.showNewAccountForm = false;
        this.success = 'New account created successfully';
        this.loading = false;
        
        // Clear the success message after 3 seconds
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (error) => {
        this.error = error.error?.message || 'Error creating account. Please try again.';
        this.loading = false;
        
        // Clear the error message after 5 seconds
        setTimeout(() => (this.error = ''), 5000);
      }
    });
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