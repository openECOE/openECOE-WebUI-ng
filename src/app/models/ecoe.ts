import {Item} from '@infarm/potion-client';

export class ECOE extends Item {
  id: number;
  name: string;
  id_organization: number;
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

  id_ecoe: number;
  id_planner: number;
  planner_order: number;
}
