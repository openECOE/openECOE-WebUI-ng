import { Item } from '@openecoe/potion-client';
import { ECOE } from './ecoe';

export class Template extends Item {
    id: number;
    html: string;
    ecoe: ECOE | number;
}
