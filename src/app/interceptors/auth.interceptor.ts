import {Injectable, Injector} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthenticationService} from '@services/authentication/authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private authService: AuthenticationService

  constructor(
    private injector: Injector
  ) {
  }

  private token;
  private authData;

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    this.authService = this.injector.get(AuthenticationService);
    const _userLogged = this.authService.userLogged;

    if (_userLogged) {
      const currentUser = _userLogged;
      let authHeader = '';

      
      if (currentUser?.token) {
        authHeader = `Bearer ${currentUser.token}`;
      } else if (currentUser?.authData) {
        authHeader = `Basic ${currentUser.authData}`;
      }

      request = request.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      });
    }
    

    return next.handle(request);
  }
}
