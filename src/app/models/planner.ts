import {Item} from '@infarm/potion-client';
import {ECOE, Student} from './ecoe';

export class Planner extends Item {
  id: number;
  shift: Shift | number;
  round: Round | number;

  students: Student | number[];
}

export class Round extends Item {
  id: number;
  ecoe: ECOE | number;
  round_code: string;
  description: string;
  planners: Planner[];
}

export class Shift extends Item {
  id: number;
  ecoe: ECOE | number;
  shift_code: string;
  timeStart: Date;
}
