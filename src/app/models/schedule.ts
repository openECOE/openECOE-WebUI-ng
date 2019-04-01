import {Item} from '@infarm/potion-client';
import {ECOE, Station} from './ecoe';

export class Schedule extends Item {
  id: number;
  ecoe: ECOE;
  stage: Stage;
  events: Event[];
  station: Station;
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
  schedule: Schedule;
  is_countdown: boolean;
}
