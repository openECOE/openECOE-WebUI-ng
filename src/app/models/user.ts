import {Item, Route} from '@openecoe/potion-client';
import {Organization} from './organization';
import {Role, Roles} from './roles';

export class User extends Item {
  id: number;
  email: string;
  name: string;
  surname: string;
  token_expiration: Date;
  organization: Organization;
  password: string;
  roles?: Role[];

  me = Route.GET<User>('/me');
}

export class UserLogged {
  user: User;
  role: string;

  constructor(user: User) {
    this.user = user;
    this.role = user.is_superadmin ? Roles.Admin : null;
  }
}
