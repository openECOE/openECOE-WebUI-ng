import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthenticationService} from '@services/authentication/authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthenticationService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentUser = this.authService.userLogged;
    const authHeader = currentUser && currentUser.token ? `Bearer ${currentUser.token}` :
      currentUser && currentUser.authData ? `Basic ${currentUser.authData}` : '';

    request = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    return next.handle(request);
  }
}
