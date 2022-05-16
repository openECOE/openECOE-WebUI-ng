import {Item, Pagination, Route} from '@openecoe/potion-client';
import {Planner, Round, Shift} from './planner';
import {Schedule, Stage} from './schedule';
import {Organization} from './organization';
import {Question} from '@models/question';

export class ECOE extends Item {
  areas = Route.GET<Area | Pagination<Area>>('/areas');
  stations = Route.GET<Station | Pagination<Station>>('/stations');
  schedules = Route.GET<Schedule | Pagination<Schedule>>('/schedules');
  students = Route.GET<Student | Pagination<Student>>('/students');
  rounds = Route.GET<Round | Round[] | Pagination<Round>>('/rounds');
  shifts = Route.GET<Shift | Shift[] | Pagination<Shift>>('/shifts');
  stages = Route.GET<Stage | Pagination<Stage>>('/stages');

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

export interface RowQblock {
  name: any[];
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
