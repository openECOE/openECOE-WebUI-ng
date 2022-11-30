import {Item, Route} from '@openecoe/potion-client';
import {Organization} from './organization';
import {enumRole, Role} from './role';

export class User extends Item {
  id: number;
  email: string;
  name: string;
  surname: string;
  token_expiration: Date;
  organization: Organization;
  password: string;

  roles = Route.GET<Array<Role>>('/roles');
  static me = Route.GET<User>('/me');
}

export class UserLogged {
  user: User;
  roles: Array<String>;

  constructor(user: UserLogged = null) {
    if (user) {      
      this.user = new User(user.user);
      this.roles = user.roles;
    } else {
      this.roles = [];
    }
    
  }

  get role() {return this.user.is_superadmin ? "administrator" : null}
  get isEval() {return this.roles.includes("evaluator")} 
  get isAdmin() {return this.roles.includes("administrator")}
}
