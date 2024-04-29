import { Item } from '@openecoe/potion-client';
import { User } from './user';

export enum enumPermissions {
    Create = "create",
    Delete = "delete",
    Manage = "manage",
    Read = "read",
    Update = "update",
}

export class ApiPermissions extends Item {
    id: number;
    user: User;
    name: string;
    idObject: number | string;
    object: string;
}
