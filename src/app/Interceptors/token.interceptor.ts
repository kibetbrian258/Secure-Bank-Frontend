import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('token');
    
    // Clone the request and add the authorization header if token exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
  }

  return next.handle(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 (Unauthorized) errors by redirecting to login
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
}
}
