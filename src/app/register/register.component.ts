import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Customer } from '../models/Customer';
import { AuthService } from '../Services/auth.service';
import { RegistrationRequest } from '../models/registration-request';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  registrationSuccess = false;
  registrationResult: Customer | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Initialize the form with validators including the new fields
    this.registerForm = this.formBuilder.group({
      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', [Validators.required, this.ageRestrictionValidator]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[7|1][0-9]{8}$/)],
      ],
      address: ['', [Validators.required, Validators.minLength(5)]],
    });
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
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 18 ? null : { ageRestriction: true };
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    // Create updated registration request with new fields
    const request: RegistrationRequest = {
      fullName: this.f['fullName'].value,
      email: this.f['email'].value,
      dateOfBirth: this.f['dateOfBirth'].value,
      phoneNumber: this.f['phoneNumber'].value, // Send just the significant digits - backend will add +254
      address: this.f['address'].value,
    };

    this.authService.register(request).subscribe({
      next: (response) => {
        this.registrationSuccess = true;
        this.registrationResult = response;
        this.loading = false;
      },
      error: (error) => {
        this.error =
          error.error.message ||
          error.error.error ||
          'Registration failed. Please try again.';
        this.loading = false;
      },
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
