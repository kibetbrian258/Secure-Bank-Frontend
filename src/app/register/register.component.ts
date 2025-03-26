// src/app/components/auth/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Customer } from '../models/Customer';
import { AuthService } from '../Services/auth.service';
import { RegistrationRequest } from '../models/registration-request';

interface CountryCode {
  name: string;
  code: string;
  pattern: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  registrationSuccess = false;
  registrationResult: Customer | null = null;
  
  // East African Country Codes
  eastAfricanCountries: CountryCode[] = [
    { name: 'Kenya', code: '+254', pattern: '^[7|1][0-9]{8}$' },
    { name: 'Uganda', code: '+256', pattern: '^[7|4][0-9]{8}$' },
    { name: 'Tanzania', code: '+255', pattern: '^[6|7][0-9]{8}$' },
    { name: 'Rwanda', code: '+250', pattern: '^[7][0-9]{8}$' },
    { name: 'Burundi', code: '+257', pattern: '^[7|2][0-9]{7}$' },
    { name: 'South Sudan', code: '+211', pattern: '^[9][0-9]{8}$' },
    { name: 'Ethiopia', code: '+251', pattern: '^[9][0-9]{8}$' },
    { name: 'Somalia', code: '+252', pattern: '^[6][0-9]{8}$' },
    { name: 'Djibouti', code: '+253', pattern: '^[7][0-9]{7}$' },
    { name: 'Eritrea', code: '+291', pattern: '^[7][0-9]{7}$' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Initialize the form with validators including the new fields
    this.registerForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', [Validators.required, this.ageRestrictionValidator]],
      country: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{7,10}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]]
    });
  }
  
  // Handle country selection change
  onCountryChange(): void {
    const countryCode = this.f['country'].value;
    if (countryCode) {
      // Find selected country
      const selectedCountry = this.eastAfricanCountries.find(country => country.code === countryCode);
      if (selectedCountry) {
        // Update phone number validator based on country pattern
        this.f['phoneNumber'].setValidators([
          Validators.required,
          Validators.pattern(selectedCountry.pattern)
        ]);
      }
    } else {
      // Reset to default validator if no country selected
      this.f['phoneNumber'].setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]{7,10}$/)
      ]);
    }
    
    // Update validators and clear any existing errors
    this.f['phoneNumber'].updateValueAndValidity();
  }

  // Age restriction validator (18+ years)
  ageRestrictionValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }
    
    const birthDate = new Date(control.value);
    const today = new Date();
    
    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // If not yet had birthday this year, subtract one year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 18 ? null : { 'ageRestriction': true };
  }

  // Convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    // Combine country code with phone number
    const countryCode = this.f['country'].value;
    const phoneNumber = this.f['phoneNumber'].value;
    const fullPhoneNumber = countryCode + phoneNumber;

    // Create updated registration request with new fields
    const request: RegistrationRequest = {
      fullName: this.f['fullName'].value,
      email: this.f['email'].value,
      dateOfBirth: this.f['dateOfBirth'].value,
      phoneNumber: fullPhoneNumber,
      address: this.f['address'].value
    };

    this.authService.register(request)
      .subscribe({
        next: (response) => {
          this.registrationSuccess = true;
          this.registrationResult = response;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.error.message || error.error.error || 'Registration failed. Please try again.';
          this.loading = false;
        }
      });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}