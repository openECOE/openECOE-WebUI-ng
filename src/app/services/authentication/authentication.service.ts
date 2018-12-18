import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  authUrl: string = '/auth/tokens';

  constructor(private http: HttpClient) {
  }

  loginUser(userData: { email: string, password: string }): Observable<any> {
    const hashedCredentials = btoa(userData.email + ':' + userData.password);
    localStorage.setItem('userLogged', JSON.stringify({authData: hashedCredentials}));

    return this.http.post(environment.API_ROUTE + this.authUrl, userData).pipe(
      map((data: any) => {
        if (data) {
          localStorage.setItem('userLogged', JSON.stringify(data));
        }

        return data;
      }),
      catchError(err => {
        this.logout();
        return err;
      })
    );
  }

  logout() {
    localStorage.removeItem('userLogged');
  }

  get userLogged(): any {
    return JSON.parse(localStorage.getItem('userLogged'));
  }
}
