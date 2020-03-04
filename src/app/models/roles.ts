import {Item, Route} from '@openecoe/potion-client';

export enum Roles {
  User = 'User',
  Admin = 'Admin'
}

export class Role {
  name: string;
  order: number;
}
