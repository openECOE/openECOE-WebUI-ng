import {Item, Pagination, Route} from '@openecoe/potion-client';
import {ECOE, Station} from './ecoe';

export class Schedule extends Item {
  id: number;
  ecoe: ECOE;
  stage: Stage;
  station: Station | number;

  events = Route.GET<Pagination<Event>>('/events');
}

export class Stage extends Item {
  id: number;
  duration: number;
  order: number;
  name: string;

  ecoe: ECOE;
}

export class Event extends Item {
  id: number;
  time: number;
  sound: string;
  text: string;
  schedule: Schedule;
  isCountdown: boolean;
}
