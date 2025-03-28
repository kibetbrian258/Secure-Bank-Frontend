import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../Environments/environment';
import { TransactionResponse } from '../models/TransactionResponse';
import { DepositRequest } from '../models/DepositRequest';
import { WithdrawRequest } from '../models/WithdrawRequest';
import { TransferRequest } from '../models/TransferRequest';
import { TransactionSearchRequest } from '../models/TransactionSearchRequest';
import { PagedResponse } from '../models/PagedResponse';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/api/transactions`;

  constructor(private http: HttpClient) {}

  // Error handling method
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage =
        error.error?.message ||
        `Error Code: ${error.status}, Message: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => error);
  }

  // Get recent transactions for an account
  getRecentTransactions(
    accountNumber: string
  ): Observable<TransactionResponse[]> {
    return this.http
      .get<TransactionResponse[]>(`${this.apiUrl}/recent/${accountNumber}`)
      .pipe(catchError(this.handleError));
  }

  // Deposit funds
  deposit(request: DepositRequest): Observable<TransactionResponse> {
    return this.http
      .post<TransactionResponse>(`${this.apiUrl}/deposit`, request)
      .pipe(catchError(this.handleError));
  }

  // Withdraw funds
  withdraw(request: WithdrawRequest): Observable<TransactionResponse> {
    return this.http
      .post<TransactionResponse>(`${this.apiUrl}/withdraw`, request)
      .pipe(catchError(this.handleError));
  }

  // Transfer funds
  transfer(request: TransferRequest): Observable<TransactionResponse> {
    return this.http
      .post<TransactionResponse>(`${this.apiUrl}/transfer`, request)
      .pipe(catchError(this.handleError));
  }

  // Search transactions
  searchTransactions(
    searchRequest: TransactionSearchRequest
  ): Observable<TransactionResponse[]> {
    return this.http
      .post<TransactionResponse[]>(`${this.apiUrl}/search`, searchRequest)
      .pipe(catchError(this.handleError));
  }

  // Search transactions with pagination
  searchTransactionsPaginated(
    searchRequest: TransactionSearchRequest,
    page: number = 0,
    size: number = 10
  ): Observable<PagedResponse<TransactionResponse>> {
    return this.http
      .post<PagedResponse<TransactionResponse>>(
        `${this.apiUrl}/search/paged?page=${page}&size=${size}`,
        searchRequest
      )
      .pipe(catchError(this.handleError));
  }
}
