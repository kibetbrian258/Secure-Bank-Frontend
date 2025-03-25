// src/app/components/auth/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Customer } from '../models/Customer';
import { AuthService } from '../Services/auth.service';
import { RegistrationRequest } from '../models/registration-request';

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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Initialize the form with validators
    this.registerForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]]
    });
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

    const request: RegistrationRequest = {
      fullName: this.f['fullName'].value,
      email: this.f['email'].value
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