import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../Services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  successMessage = '';
  showPin = false;
  returnUrl: string = '/dashboard';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Initialize the form with validators
    this.loginForm = this.formBuilder.group({
      customerId: ['', Validators.required],
      pin: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]{4}$'), // 4-digit PIN
        ],
      ],
    });

    // Get return URL from route parameters or default to '/dashboard'
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Check for query parameters that might be set after registration
    const customerId = this.route.snapshot.queryParams['customerId'];
    if (customerId) {
      this.loginForm.patchValue({ customerId });
      this.successMessage =
        'Registration successful! Please login with your PIN.';
    }
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.successMessage = '';

    // Stop if the form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const loginRequest = {
      customerId: this.f['customerId'].value.trim(),
      pin: this.f['pin'].value,
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        // Navigate to the return URL
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.error =
          error.error.message ||
          error.error.error ||
          'Login failed. Please check your credentials.';
        this.loading = false;
      },
    });
  }

  togglePinVisibility(): void {
    this.showPin = !this.showPin;
  }
}
