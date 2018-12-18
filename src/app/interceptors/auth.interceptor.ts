import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {AuthenticationService} from '../services/authentication/authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthenticationService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentUser = this.authService.userLogged;
    const authHeader = currentUser.token ? `Bearer ${currentUser.token}` : currentUser.authData ? `Basic ${currentUser.authData}` : '';

    request = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    return next.handle(request).pipe(
      catchError(error => {

        if (error.status === 401) {
          this.authService.logout();
          location.reload(true);
        }

        return throwError(error);
      })
    );
  }
}
