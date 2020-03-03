import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthenticationService} from '../../services/authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {
  constructor(private router: Router,
              private authService: AuthenticationService) {

  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const userLogged = this.authService.userLogged;
    const userData = this.authService.userData;

    if (userLogged && userData) {
      // check if route is restricted by role
      if (next.data && next.data.roles.indexOf(userData.role) === -1) {
        // role not authorised so redirect to home page
        this.router.navigate(['/']).finally();
        return false;
      }

      // authorised so return true
      return true;
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
    return false;

  }
}
