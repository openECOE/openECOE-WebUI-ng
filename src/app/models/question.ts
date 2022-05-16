import {Item, Route} from '@openecoe/potion-client';
import {Area, Option, QBlock} from '@models/ecoe';

export class Question extends Item {
  id: number;
  reference: string;
  description: string;
  questionType: string;
  order: number;

  addOption ? = Route.POST<Option>('/options');

  area: Area;

  options: Option[];
  qblocks: QBlock[] | number[];

  getPoints ? = Route.GET<number>('/points');
}

export interface RowQuestion {
  order:  any[] | number;
  description: any[] | string;
  reference: any[] | string;
  area: any[] | Area;
  questionType: any[] | string;
  optionsNumber?: number;
  points?: any[];
  options?: Option[];
  qblocks?: number[];
  id?: any[] | number;
}
