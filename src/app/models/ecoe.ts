import {Item, Pagination, Route} from '@openecoe/potion-client';
import {Planner} from './planner';
import {Schedule} from './schedule';
import {Organization} from './organization';

export class ECOE extends Item {
  areas = Route.GET('/areas');
  stations = Route.GET<Station | Pagination<Station>>('/stations');
  schedules = Route.GET('/schedules');
  students = Route.GET('/students');
  rounds = Route.GET('/rounds');
  shifts = Route.GET('/shifts');

  id: number;
  name: string;
  organization: Organization;

  configuration = Route.GET('/configuration');
}

export class Area extends Item {
  id: number;
  name: string;
  ecoe: ECOE;
  code: string;
  questions: Question[];
}

export class EditCache extends Area {
  new_item?: boolean;
  edit?: boolean;
}

export interface RowArea {
  name: any[];
  code: any[];
  questions?: any[];
}

export class Station extends Item {
  id: number;
  name: string;
  ecoe: ECOE;
  order: number;
  parentStation?: {
    id: number
    name?: string,
  };
  id_parent_station: number;

  qblocks = Route.GET<Pagination<QBlock>>('/qblocks');
  schedules = Route.GET<Pagination<Schedule>>('/schedules');
}

export interface RowStation {
  order: any[];
  name: any[];
  parentStation?: any[];
}

export class QBlock extends Item {
  getQuestions = Route.GET<Pagination<Question>>('/questions');

  id: number;
  name: string;
  order: number;

  station: Station;
  questions?: Question[];
}

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

export class Option extends Item {
  id: number;
  points: number;
  label: string;
  id_question: number;
  order: number;
}
export class Answer extends Item {
  id: number;
  label: string;
  order: number;
  points: number;
  uri: string;
  question?: Question;
}

export class RowOption {
  order: any | number;
  label: any[] | string;
  points: any[] | number;
  rateCount?: number;
  id?: number;

  constructor(order, label, points) {
    this.order = order;
    this.label = label;
    this.points = points;
  }
}

export class Student extends Item {
  id: number;
  name: string;
  surnames: string;
  dni: string;

  ecoe: ECOE | number;
  planner: Planner | Item;
  plannerOrder?: number;
  planner_order?: number;

  addAnswer ? = Route.POST('/answers');

  getAnswers ? = Route.GET('/answers');
  getAllAnswers ? = Route.GET('/answers/all');
}

export interface BlockType {
  name: string;
  order: number;
  questions: Question[];
}
