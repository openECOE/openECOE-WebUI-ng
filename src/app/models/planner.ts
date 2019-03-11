import {Item} from '@infarm/potion-client';

export class Planner extends Item {
  id: number;
  id_shift: number;
  id_round: number;
}

export class Round extends Item {
  id: number;
  id_ecoe: number;
  round_code: string;
  description: string;
}

export class Shift extends Item {
  id: number;
  id_ecoe: number;
  shift_code: string;
  time_start: number;
}
