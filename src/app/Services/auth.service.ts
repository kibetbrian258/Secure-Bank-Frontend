import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { RegistrationRequest } from '../models/registration-request';
import { JwtResponse } from '../models/jwt-response';
import { Customer } from '../models/Customer';
import { LoginRequest } from '../models/LoginRequest';
import { CustomerProfile } from '../models/CustomerProfile';
import { environment } from '../Environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private customerProfileUrl = `${environment.apiUrl}/api/customers/profile`;
  private currentUserSubject: BehaviorSubject<string | null>;
  public currentUser: Observable<string | null>;

  constructor(private http: HttpClient) {
    // Get the customerId from local storage if available
    this.currentUserSubject = new BehaviorSubject<string | null>(
      localStorage.getItem('currentUser')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): string | null {
    return this.currentUserSubject.value;
  }

  register(request: RegistrationRequest): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/register`, request).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  login(request: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => {
        // Store JWT token and customerId in local storage
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', response.customerId);
        this.currentUserSubject.next(response.customerId);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    // Remove JWT token and customerId from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue && !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCustomerProfile(): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(this.customerProfileUrl).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Updates the customer profile information
   * @param profileData Updated profile data
   * @returns Observable with the updated profile
   */
  updateCustomerProfile(
    profileData: Partial<CustomerProfile>
  ): Observable<CustomerProfile> {
    return this.http
      .put<CustomerProfile>(this.customerProfileUrl, profileData)
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
}
