import {Item, Route} from '@openecoe/potion-client';
import {User} from './user';

export enum enumRole {
  User = 'User',
  Admin = 'administrator',
  Eval = 'evaluator'
}

export class Role extends Item {
  id: number;
  user: User;
  name: string;
}
