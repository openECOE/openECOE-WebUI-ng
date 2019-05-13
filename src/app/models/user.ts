import {Item} from '@infarm/potion-client';
import {Organization} from './organization';
import {Role} from './role';

export class User extends Item {
  id: number;
  email: string;
  name: string;
  surname: string;
  isSuperadmin: boolean;
  token_expiration: Date;
  organization: Organization;
  password: string;
}

export class UserLogged {
  user: User;
  role: string;

  constructor(user: User) {
    this.user = user;
    this.role = user.is_superadmin ? Role.Admin : null;
  }
}
