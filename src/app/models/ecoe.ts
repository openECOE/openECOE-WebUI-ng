import {Item} from '@infarm/potion-client';
import {Planner, Round, Shift} from './planner';
import {Schedule} from './schedule';
import {Organization} from './organization';

export class ECOE extends Item {
  id: number;
  name: string;
  organization: Organization;


  areas: Area[];
  stations: Station[];
  schedules: Schedule[];
  students: Student[];
  rounds: Round[];
  shifts: Shift[];
}

export class Area extends Item {
  id: number;
  name: string;
  id_ecoe: number;
  code: string;
}

export class Station extends Item {
  id: number;
  name: string;
  id_ecoe: number;
  order: number;
  parentStation: any;
  id_parent_station: number;
}

export class QBlock extends Item {
  id: number;
  name: string;
  id_station: number;
  order: number;
}

export class Question extends Item {
  id: number;
  reference: string;
  description: string;
  id_area: number;
  question_type: number;
  order: number;
}

export class Option extends Item {
  id: number;
  points: number;
  label: string;
  id_question: number;
  order: number;
}

export class Student extends Item {
  id: number;
  name: string;
  surnames: string;
  dni: string;

  ecoe: ECOE;
  planner: Planner | Item;
  plannerOrder: number;


}
