import { Injectable, Injector } from '@angular/core';
import { enumRole } from '@app/models/role';
import { User, UserLogged } from '@app/models/user';
import { Subject } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private _userData: UserLogged = null;
  userDataChange: Subject<UserLogged> = new Subject<UserLogged>();
  
  private auth: AuthenticationService

  constructor(private inject: Injector) { 
    this._init();
  }

  async _init() {
    this.auth = this.inject.get(AuthenticationService)
    this.auth.userTokenChange.subscribe(userToken => {
      this.changeUser(userToken)
    })

    if (this.auth.userToken) {
      this.userData = await this.loadUserData();
    }
  }

  changeUser(userToken) {
    if (userToken) {
      this.loadUserData().then(user => {
        this.userData = user;
      })
    } else {
      this.userData = null;
    }
  }

  get userData() {
    return this._userData;
  }

  set userData(data: UserLogged) {
    this._userData = data;
    this.userDataChange.next(data);
  }

  async loadUserData(): Promise<UserLogged> {
    try {
      const _user = await User.me();
      const _userLogged = new UserLogged();

      _userLogged.user = _user;
      _userLogged.roles = (await _user.roles()).map(role => role.name)
      if (_user.isSuperadmin)
        {_userLogged.roles.push(enumRole.Admin)}
      return _userLogged;
    } catch (error) {
      this.auth.logout('/login');
      throw error;
    }
  }
}
