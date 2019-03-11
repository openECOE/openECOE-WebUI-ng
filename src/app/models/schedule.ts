import {Item} from '@infarm/potion-client';

export class Schedule extends Item {
  id: number;
  id_ecoe: number;
  id_stage: number;
  id_station: number;
}

export class Stage extends Item {
  id: number;
  duration: number;
  order: number;
  name: string;
}

export class Event extends Item {
  id: number;
  time: number;
  sound: string;
  text: string;
  id_schedule: number;
  is_countdown: boolean;
}
