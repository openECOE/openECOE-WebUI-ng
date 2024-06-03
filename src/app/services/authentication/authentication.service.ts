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

  private storageToken = 'userLogged'

  constructor(private http: HttpClient,
              private router: Router) {
      this._init();
  }

  _init() {
    const _userLog = this.userLogged
    if (_userLog) {
      this.userToken = _userLog
    }
    
  }

  get userToken() {
    if (!this._userToken) {
      const _tokenStored = localStorage.getItem(this.storageToken);
      try {
        this.userToken = JSON.parse(_tokenStored)
      } catch {}
    }

    return this._userToken;
  }

  set userToken(data: IUserToken) {
    this._userToken = data;
    if (data) {
      localStorage.setItem(this.storageToken, JSON.stringify(data));
    } else {
      localStorage.removeItem(this.storageToken)
    }
    
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
        this.logout();
        return throwError(err);
      })
    );
  }

  logout(route: string = '/login') {
    this.userToken = null;
    this.router.navigate([route]).then(window.location.reload);
  }

  get userLogged(): any {
    return this.userToken
  }
}
