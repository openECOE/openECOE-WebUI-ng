import {Item, Pagination, Route} from '@openecoe/potion-client';
import {Planner, Round, Shift} from './planner';
import {Schedule} from './schedule';
import {Organization} from './organization';
import {FormArray} from '@angular/forms';

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
  id: number;
  name: string;
  order: number;

  station: Station;
  questions?: Question[];

  getQuestions = Route.GET<Pagination<Question>>('/questions');
}

export class Question extends Item {
  id: number;
  reference: string;
  description: string;
  // question_type: string;
  questionType: string;
  order: number;

  addOption ? = Route.POST<Option>('/option');

  area: Area;

  options: Option[];
  qblocks: QBlock[];

  getPoints ? = Route.GET<number>('/points');
}

export interface RowQuestion {
  order: any[];
  description: any[];
  reference: any[];
  area: any[];
  questionType: any[];
  optionsNumber?: number;
  options?: any[];
}

export class Option extends Item {
  id: number;
  points: number;
  label: string;
  id_question: number;
  order: number;
}

export interface RowOption {
  order: any[];
  text: any[];
  points: any[];
}

export class Student extends Item {
  id: number;
  name: string;
  surnames: string;
  dni: string;

  ecoe: ECOE | number;
  planner: Planner | Item;
  plannerOrder: number;
  planner_order: number;


}
