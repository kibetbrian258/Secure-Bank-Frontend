// src/app/Services/account.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../Environments/environment';
import { AccountResponse } from '../models/AccountResponse';

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
}
