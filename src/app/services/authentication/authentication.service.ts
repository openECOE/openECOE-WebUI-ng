import {Injectable} from '@angular/core';
import {Observable, Subject, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {UserLogged, User, Role, enumRole} from '../../models';

interface IUserToken {
  token: string;
  expiration: Date;
}

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {

  authUrl: string = '/auth/tokens';
  private _userData: UserLogged;
  userDataChange: Subject<UserLogged> = new Subject<UserLogged>();

  private _userToken: IUserToken;
  userTokenChange: Subject<IUserToken> = new Subject<IUserToken>();

  constructor(private http: HttpClient,
              private router: Router) {
      this.userDataChange.subscribe((data) => {
        this._userData = data;
      })

      this._init();
  }

  async _init() {
    if (this.userLogged) {
      this._userData = await this.loadUserData()
    }
  }

  get userData() {
    return this._userData;
  }

  set userData(data: UserLogged) {
    this.userDataChange.next(data);
  }

  get userToken() {
    return this._userToken;
  }

  set userToken(data: IUserToken) {
    this.userTokenChange.next(data);
  }

  loginUser(userData: { email: string, password: string }): Observable<any> {
    const hashedCredentials = btoa(userData.email + ':' + userData.password);
    localStorage.setItem('userLogged', JSON.stringify({authData: hashedCredentials}));

    return this.http.post(environment.API_ROUTE + this.authUrl, userData).pipe(
      map(async (data: any) => {
        localStorage.removeItem('userLogged');

        if (data) {
          localStorage.setItem('userLogged', JSON.stringify(data));
          this.userData = await this.loadUserData();
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

  logout(route: string = '/login') {
    localStorage.removeItem('userLogged');
    this.userData = undefined;
    this.router.navigate([route]);
  }

  get userLogged(): any {
    const _userLogged = localStorage.getItem('userLogged');
    return JSON.parse(_userLogged);
  }

  async getData(): Promise<UserLogged> {
    if (!this.userData && this.userLogged) {
      return this.loadUserData()
    } else {
      return this.userData
    }
    
  }

  async loadUserData(): Promise<UserLogged> {
    try {
      const _user = await User.me();
      const _userLogged = new UserLogged();

      _userLogged.user = _user;
      _userLogged.roles = (await _user.roles()).map(role => role.name)
      if (_user.isSuperadmin)
        {_userLogged.roles.push(enumRole.Admin)}
      return new UserLogged(_userLogged);
    } catch (error) {
      if (error.status === 401) {
        this.logout('/login');
      }
      return error;
    }

  }
}
