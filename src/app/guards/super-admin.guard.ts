import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of, Subscriber } from 'rxjs';
import { UserService } from '../services/user/user.service';
import { UserLogged } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminGuard implements CanActivate {

  constructor(private router: Router, private userService: UserService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return new Observable<boolean | UrlTree>(observer => {
      if(this.userService.userData) {
        this.checkRole(this.userService.userData, observer);
      }
      else {
        this.userService.userDataChange.subscribe((user: UserLogged) => {
          this.checkRole(user, observer);
        });
      }
    });
  }

  private checkRole(user: UserLogged, observer: Subscriber<boolean | UrlTree>): void {
    user.isSuper 
      ? observer.next(true) 
      : observer.next(this.router.createUrlTree(['/ecoe']));
    observer.complete();
  }
}
