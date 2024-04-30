import {
  Item as potionItem,
  Pagination,
  readonly,
  route,
  Route,
} from "@openecoe/potion-client";
import { Planner, Round, Shift } from "./planner";
import { Schedule, Stage } from "./schedule";
import { Organization } from "./organization";
import { QuestionOld, Block, Question } from "@models/question";
import { User } from "@models/user";
import { Answer, ApiPermissions } from ".";

export class Permission extends potionItem {
  "create": boolean;
  "delete": boolean;
  "evaluate": boolean;
  "manage": boolean;
  "read": boolean;
}

export class Item extends potionItem {
  @readonly
  permissions = Route.GET<Permission>("/permissions");

  can = {
    create: async () => (await this.permissions()).create,
    delete: async () => (await this.permissions()).delete,
    evaluate: async () => (await this.permissions()).evaluate,
    manage: async () => (await this.permissions()).manage,
    read: async () => (await this.permissions()).read,
  };

  save(): Promise<this> {
    delete this.can;
    return super.save();
  }
}

export class Job extends Item {
  id: string;
  name: string;
  progress: number;
  complete: boolean;
  user: User;
  created: Date;
  finished: Date;
  description: string;
  file: string;
}

export class ECOE extends Item {
  areas = Route.GET<Area | Pagination<Area>>("/areas");
  stations = Route.GET<Station | Pagination<Station>>("/stations");
  schedules = Route.GET<Schedule | Pagination<Schedule>>("/schedules");
  students = Route.GET<Student | Pagination<Student>>("/students");
  rounds = Route.GET<Round | Round[] | Pagination<Round>>("/rounds");
  shifts = Route.GET<Shift | Shift[] | Pagination<Shift>>("/shifts");
  stages = Route.GET<Stage | Pagination<Stage>>("/stages");
  evaluators = Route.GET<ApiPermissions | Pagination<ApiPermissions>>("/evaluators");

  id: number;
  name: string;
  organization: Organization;
  jobReports: Job;
  jobCsv: Job;

  static archive = Route.GET<ECOE | Pagination<ECOE>>("/archive");
  static dearchive = Route.POST("/archive/<int:id>/restore");

  configuration = Route.GET("/configuration");
  results = Route.GET("/results");
  itemscore = Route.GET("/item-score");
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
  name: string;
  ecoe: ECOE;
  order: number;
  parentStation?: Station;
  user: User;
  childrenStations: Station[];

  qblocks = Route.GET<Pagination<Block>>("/blocks");
  schedules = Route.GET<Pagination<Schedule>>("/schedules");
  questions = Route.GET<Pagination<QuestionOld>>("/questions");
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
  name: string;
  surnames: string;
  dni: string;

  ecoe: ECOE | number;
  planner: Planner | Item;
  planner_order?: number;

  public set plannerOrder(v: number) {
    this.planner_order = v;
  }

  public get plannerOrder(): number {
    return this.planner_order;
  }

  addAnswer? = Route.POST("/answers");

  getAnswers? = Route.GET("/answers");
  getAllAnswers? = Route.GET<Array<Answer>>("/answers/all");
  // getAnswersStation ? = Route.GET('/answers/station/');
  getAnswersStation? = (station: Number) =>
    Route.GET("/answers/station/" + station.toString());

  save(): Promise<this> {
    return super.save();
  }
}

export interface BlockType {
  name: string;
  order: number;
  questions: Question[];
}
