import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Get token from auth service
    const token = this.authService.getToken();

    // If token exists, add it to the Authorization header
    if (token) {
      const clonedReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Adding token to request:', request.url);
      return next.handle(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Request error:', error);
          // If there's a 401 Unauthorized error, log the user out and redirect to login
          if (error.status === 401) {
            console.log('401 error, logging out');
            this.authService.logout();
            this.router.navigate(['/login'], {
              queryParams: { returnUrl: this.router.url },
            });
          }
          return throwError(() => error);
        })
      );
    }

    // If no token, just pass the request through
    return next.handle(request);
  }
}
