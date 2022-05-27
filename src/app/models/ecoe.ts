import {Item, Pagination, route, Route} from '@openecoe/potion-client';
import {Planner, Round, Shift} from './planner';
import {Schedule, Stage} from './schedule';
import {Organization} from './organization';
import {QuestionOld, Block, Question} from '@models/question';
import {User} from '@models/user';
import { Answer } from '.';

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
  questions: QuestionOld[];
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
  parentStation?: Station;
  user: User;

  children_stations: Station[];

  qblocks = Route.GET<Pagination<Block>>('/blocks');
  schedules = Route.GET<Pagination<Schedule>>('/schedules');
  questions = Route.GET<Pagination<QuestionOld>>('/questions');
}

export interface RowStation {
  order: any[];
  name: any[];
  parentStation?: any[];
}

export class AnswerOld extends Item {
  id: number;
  label: string;
  order: number;
  points: number;
  uri: string;
  question?: QuestionOld;
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
  getAllAnswers ? = Route.GET<Array<Answer>>('/answers/all');
  // getAnswersStation ? = Route.GET('/answers/station/');
  getAnswersStation ? = (station: Number) => Route.GET('/answers/station/' + station.toString());

}

export interface BlockType {
  name: string;
  order: number;
  questions: Question[];
}
