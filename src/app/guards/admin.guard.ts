import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../services/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router, private userService: UserService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return new Observable<boolean | UrlTree>(observer => {
      const user = this.userService.userData;
      if (user) {
        if (user.isAdmin || user.isSuper) {
          observer.next(true);
        } else {
          observer.next(this.router.createUrlTree(['/ecoe']));
        }
        observer.complete();
      } else {
        const subscription = this.userService.userDataChange.subscribe(userData => {
          if (userData && userData.isAdmin || userData.isSuper) {
            observer.next(true);
          } else {
            observer.next(this.router.createUrlTree(['/ecoe']));
          }
          observer.complete();
          subscription.unsubscribe();
        });
      }
    });
  }
}
