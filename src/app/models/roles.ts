import {Item} from '@openecoe/potion-client';

export enum Roles {
  User = 'User',
  Admin = 'Admin'
}

export class Role {
  name: string;
  order?: number;
  $uri?: string;
  user?: Object;
}

export class RoleItem extends Item {
  id: number;
  user: number;
  name: string;
}
