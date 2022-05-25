import {Injectable} from '@angular/core';
import {Observable, Subject, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {Router} from '@angular/router';

interface IUserToken {
  token: string;
  expiration: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private authUrl: string = '/auth/tokens';
  
  private _userToken: IUserToken;
  userTokenChange: Subject<IUserToken> = new Subject<IUserToken>();

  constructor(private http: HttpClient,
              private router: Router) {
      this._init();
  }

  _init() {
    this.userToken = this.userLogged
  }

  get userToken() {
    return this._userToken;
  }

  set userToken(data: IUserToken) {
    this._userToken = data;
    localStorage.setItem('userLogged', JSON.stringify(data));
    this.userTokenChange.next(data);
  }

  loginUser(userData: { email: string, password: string }): Observable<any> {
    const hashedCredentials = btoa(userData.email + ':' + userData.password);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Basic ${hashedCredentials}` });
    let options = { headers: headers };

    return this.http.post(environment.API_ROUTE + this.authUrl, userData, options).pipe(
      map(async (data: IUserToken) => {
        this.userToken = data;
        return !!data
      }),
      catchError(err => {
        this.userToken = null;
        return throwError(err);
      })
    );
  }

  logout(route: string = '/login') {
    this.userToken = null;
    this.router.navigate([route]);
  }

  get userLogged(): any {
    const _userLogged = localStorage.getItem('userLogged');
    return JSON.parse(_userLogged);
  }
}
