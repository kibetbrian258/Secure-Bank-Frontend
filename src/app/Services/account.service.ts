import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountResponse } from '../models/AccountResponse';
import { environment } from '../Environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private apiUrl = `${environment.apiUrl}/api/accounts`;

  constructor(private http: HttpClient) {}

  // Get all accounts for the authenticated customer
  getAccounts(): Observable<AccountResponse[]> {
    return this.http.get<AccountResponse[]>(this.apiUrl).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  // Get details for a specific account
  getAccountDetails(accountNumber: string): Observable<AccountResponse> {
    return this.http
      .get<AccountResponse>(`${this.apiUrl}/${accountNumber}`)
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  // Create a new account
  createAccount(accountType: string): Observable<AccountResponse> {
    const url = `${this.apiUrl}/create`;

    // Create request body with account type
    const newAccountRequest = {
      accountType: accountType,
    };

    return this.http.post<AccountResponse>(url, newAccountRequest).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}
