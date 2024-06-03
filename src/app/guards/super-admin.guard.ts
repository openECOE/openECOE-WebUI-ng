import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../services/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminGuard implements CanActivate {

  constructor(private router: Router, private userService: UserService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return new Observable<boolean | UrlTree>(observer => {
      const user = this.userService.userData;
      if (user) {
        if (user.isSuper) {
          observer.next(true);
        } else {
          observer.next(this.router.createUrlTree(['/ecoe']));
        }
        observer.complete();
      } else {
        const subscription = this.userService.userDataChange.subscribe(userData => {
          if (userData && userData.isSuper) {
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
