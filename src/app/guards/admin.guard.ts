import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { UserService } from '../services/user/user.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router, private userService: UserService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return from(this.userService.ensureUserDataReady()).pipe(
      map(() => {
        const user = this.userService.userData;
        if (user && user.isAdmin || user.isSuper) {
          return true;
        } else {
          return this.router.createUrlTree(['/ecoe']);
        }
      })
    );
  }
}
