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
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Handle the response and catch any auth errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // If there's a 401 Unauthorized error, log the user out and redirect to login
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url },
          });
        }
        return throwError(() => error);
      })
    );
  }
}
