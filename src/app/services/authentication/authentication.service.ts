import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {ApiService} from '../api/api.service';
import {Router} from '@angular/router';
import {UserLogged, User, Role} from '../../models';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {

  authUrl: string = '/auth/tokens';

  constructor(private http: HttpClient,
              private apiService: ApiService,
              private router: Router) {
  }

  loginUser(userData: { email: string, password: string }): Observable<any> {
    const hashedCredentials = btoa(userData.email + ':' + userData.password);
    localStorage.setItem('userLogged', JSON.stringify({authData: hashedCredentials}));

    return this.http.post(environment.API_ROUTE + this.authUrl, userData).pipe(
      map((data: any) => {
        localStorage.removeItem('userLogged');

        if (data) {
          localStorage.setItem('userLogged', JSON.stringify(data));
          this.loadUserData();
          return true;
        } else {
          return false;
        }
      }),
      catchError(err => {
        localStorage.removeItem('userLogged');
        return throwError(err);
      })
    );
  }

  logout(route: string = '/') {
    localStorage.removeItem('userLogged');
    localStorage.removeItem('userData');
    this.router.navigate([route]);
  }

  get userLogged(): any {
    return JSON.parse(localStorage.getItem('userLogged'));
  }

  get userData(): any {
    return JSON.parse(localStorage.getItem('userData'));
  }

  loadUserData() {
    return this.apiService.getResource('/api/v1/users/me')
      .pipe( map(
        async data => {
          const user = new UserLogged(data);
          const _roles: Array<Role> = await (await User.fetch<User>(data.id)).roles();

          for (const _role of _roles) {
            user.roles.push(_role.name);
          }
          localStorage.setItem('userData', JSON.stringify(user));
          return user;
        },
        err => {
          if (err.status === 401) {
            this.logout('/login');
          }
          return throwError(err);
        }
      ),
      catchError(err => {
        if (err.status === 401) {
          localStorage.removeItem('userLogged');
          this.logout('/login');
        }

        return throwError(err);
      }));
  }

  getUserData() {
    return this.apiService.getResource('/api/v1/users/me');
  }
}
