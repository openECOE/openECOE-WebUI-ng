import {Item, Route} from '@openecoe/potion-client';
import {Organization} from './organization';
import {enumRole, Role} from './role';

export class User extends Item {
  id: number;
  email: string;
  name: string;
  surname: string;
  isSuperadmin: boolean;
  token_expiration: Date;
  organization: Organization;
  password: string;

  roles = Route.GET<Array<Role>>('/roles');
}

export class UserLogged {
  user: User;
  role: string;
  roles: Array<String>;

  constructor(user: User) {
    this.user = user;
    this.role = user.is_superadmin ? enumRole.Admin : null;
    this.roles = [];
  }
}
