import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
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

  async loginUser(userData: { email: string, password: string }) {
    const hashedCredentials = btoa(userData.email + ':' + userData.password);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Basic ${hashedCredentials}` });
    let options = { headers: headers };

    try {
      const _token = await(
        this.http
          .post<IUserToken>(
            environment.API_ROUTE + this.authUrl,
            userData,
            options
          )
          .toPromise()
      );
      this.userToken = _token;
      return !!_token;
    } catch (error) {
      this.userToken = null;
      return false;
    }
  }

  logout(route: string = '/login') {
    this.userToken = null;
    this.router.navigate([route]).then(window.location.reload);
  }

  get userLogged(): any {
    return this.userToken
  }
}
