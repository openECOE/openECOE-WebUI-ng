import {Item, Pagination, Route} from '@openecoe/potion-client';
import {Area, Station, Student} from '@models/ecoe';
import {ItemUpdateOptions} from '@openecoe/potion-client/core/item';

// Question types

export class QuestionBase {
  constructor(type) {
    this.type = type;
    this.reference = null;
    this.description = null;
  }

  readonly type: string;
  reference: string;
  description: string;
  protected _max_points: number;

  set max_points(value) {
    this._max_points = Number(value);
  }

  get max_points() {
    return this._max_points;
  }
}

export class QuestionOption {
  id_option: number;
  label: string;
  order: number;
  points: number;
}

export class QuestionRadio extends QuestionBase {
  constructor() {
    super('radio');
    this.options = [];
  }

  set max_points(points: number) {

    if (this.options.length > 0) {
      // Recalculate options points, for radio assigns max points to value with max points
      const _option: QuestionOption = this.options.reduce((a, b) => (a.points > b.points) ? a : b);
      _option.points = points;
    }
  }

  options: QuestionOption[];

  get max_points() {
    // Calculate max points possible with the summatory of all positive values
    return Math.max(...this.options.filter(option => option.points > 0).map(option => option.points), 0);
  }
}

export class QuestionCheckBox extends QuestionBase {
  constructor() {
    super('checkbox');
    this.options = [];
  }

  set max_points(points: number) {
    if (this.options.length > 0) {
      // Recalculate options points, for checkbox distribute points in options based on option weight
      const diffPoints = (this.max_points / points);
      this.options.map(option => option.points = option.points * diffPoints);
    }
  }

  private _options: QuestionOption[];

  get options() {
    return this._options;
  }

  set options(_options) {
    const _questionOptions: Array<QuestionOption> = []
    for (const _option of _options) {
      const _qopt = new QuestionOption();
      for (const key of ['id_option', 'label', 'order', 'points']) {
        if (Object.prototype.hasOwnProperty.call(_option, key)) {
          _qopt[key] = _option[key];
        }
      }
      _questionOptions.push(_qopt);
    }

    this._options = _questionOptions;
  }

  get max_points() {
    // Calculate max points with the high value
    return this.options.filter(option => option.points > 0).map(option => option.points).reduce((a, b) => a + b, 0);
  }
}

export class QuestionCheckBoxAnswer {
  selected: Array<{id_option: number}>;
}

export const MaxPointsRangeError = new Error('max points should be positive in Range question');

export class QuestionRange extends QuestionBase {
  constructor() {
    super('range');
    this.range = 10;
  }

  range: number;

  // Points in range only could be positive
  set max_points(value: number) {
    if (value >= 0) {
      this._max_points = Number(value);
    } else {
      throw MaxPointsRangeError;
    }
  }

  get max_points() {
    return this._max_points;
  }
}

export class Question extends Item {
  id: number;
  area: Area | number;
  station: Station | number;
  order: number;
  block?: Block | number;
  question_schema: string;
  schema: QuestionSchema;
  max_points: number;

  answers = Route.GET<Answer>('/answers');

  set questionSchema(schema: string) {
    this.question_schema = schema;
    const _schema = JSON.parse(schema);
    this.schema = Object.assign(new QuestionSchema(_schema.type), _schema);
  }

  get questionSchema() {
    this.question_schema = JSON.stringify(this.schema);
    return this.question_schema;
  }

  set maxPoints(points: number) {
    this.max_points = points;
    if (this.schema instanceof QuestionBase) {
      this.schema.max_points = points;
    }
  }

  get maxPoints() {
    if (this.schema instanceof QuestionBase) {
      this.max_points = this.schema.max_points;
    }
    return this.max_points;
  }

  save(): Promise<this> {
    this.question_schema = this.questionSchema;
    this.max_points = this.maxPoints;
    delete this.schema;
    return super.save();
  }

  update(data?: any, options?: ItemUpdateOptions): Promise<this> {
    data.question_schema = JSON.stringify(data.schema);
    data.max_points = data?.schema?.max_points || undefined;
    delete data.schema;
    return super.update(data, options);
  }
}

export interface IQuestion {
  id?: any[] | number;
  area: any[] | Area;
  station: any[] | Station;
  order: any[] | number;
  block?: any[] | Block;
  schema: QuestionSchema;
  max_points?: any[];
}

export class Answer extends Item {
  constructor(properties?) {
    super(properties);
    this.points = 0;
  }

  id: number;
  station: Station;
  student: Student;
  question: Question;
  points: number;
  
  answerSchema: string;

  private _answer_schema: AnswerSchema;

  set schema(answerSchema: AnswerSchema | string) {
    if (typeof answerSchema === 'string') {
      const _schema = JSON.parse(answerSchema);
      this._answer_schema = Object.assign(new AnswerSchema(_schema.type), _schema);
    } else {
      this._answer_schema = answerSchema;
    }
  }

  get schema() {
    if (!this._answer_schema) {
      this.schema = this.answerSchema
    }
    return this._answer_schema as AnswerBase;
  }

  save(): Promise<this> {
    this.answerSchema = this.schema.toString();
    return super.save();
  }

  update(data?: any, options?: ItemUpdateOptions): Promise<this> {
    data.answer_schema = this.answerSchema;
    return super.update(data, options);
  }
}

export class AnswerBase {
  constructor(type) {
    this.type = type;
    this.selected = '';
  }

  readonly type: string;
  selected: any;

  toString(): String {
    return JSON.stringify(this);
  }
}

export class AnswerRadio extends AnswerBase {
  constructor() {
    super('radio');
  }
  selected: QuestionOption;
}

export class AnswerCheckBox extends AnswerBase {
  constructor() {
    super('checkbox');
    this.selected = [];
  }
  selected: Array<{id_option: number}>;
}

export class AnswerRange extends AnswerBase {
  constructor() {
    super('range');
  }
  selected: number;
}

export const QuestionType: any = {
  'radio': {class: QuestionRadio, answerClass: AnswerRadio, label: 'ONE_ANSWER'},
  'checkbox': {class: QuestionCheckBox, answerClass: AnswerCheckBox, label: 'MULTI_ANSWER'},
  'range': {class: QuestionRange, answerClass: AnswerRange, label: 'VALUE_RANGE'},
  'RB': {class: QuestionRadio, answerClass: AnswerRadio, label: 'ONE_ANSWER'},
  'CH': {class: QuestionCheckBox, answerClass: AnswerCheckBox, label: 'MULTI_ANSWER'},
  'RS': {class: QuestionRange, answerClass: AnswerRange, label: 'VALUE_RANGE'}
};

export class QuestionSchema {
  type: string;
  constructor(className: string, opts?: any) {
    if (QuestionType[className] === undefined || QuestionType[className] === null) {
      throw new Error(`Class type of \'${className}\' is not in the store`);
    }
    return new QuestionType[className]['class'](opts);
  }
}

export class AnswerSchema {
  constructor(className: string, opts?: any) {
    if (QuestionType[className] === undefined || QuestionType[className] === null) {
      throw new Error(`Class type of \'${className}\' is not in the store`);
    }
    return new QuestionType[className]['answerClass'](opts);
  }
}

export class Block extends Item {
  id: number;
  name: string;
  order: number;

  station: Station;
  questions = Route.GET<Pagination<QuestionOld>>('/questions');
}

export interface RowQblock {
  name: any[];
}


// Old

export class QBlockOld extends Item {
  getQuestions = Route.GET<Pagination<QuestionOld>>('/questions');

  id: number;
  name: string;
  order: number;

  station: Station;
  questions?: QuestionOld[];
}

export interface RowQblock {
  name: any[];
}

export class QuestionOld extends Question {
  reference: string;
  description: string;
  questionType: string;
  order: number;

  area: Area;

  options: Option[];
  qblocks: Block[] | number[];

  get getPoints() {
    return this.max_points;
  }

  // New API Question model
  block: Block;
  _questionSchema: string;
  schema: QuestionSchema;
  max_points: number;

  answers = Route.GET<Answer>('/answers');

  set questionSchema(schema: string) {
    this._questionSchema = schema;
    const _schema = JSON.parse(schema);
    this.schema = Object.assign(new QuestionSchema(_schema.type), _schema);

    this.reference = this.schema['reference'];
    this.description = this.schema['description'];
    this.questionType = this.schema['type'];

    if (this.schema instanceof QuestionRadio || this.schema instanceof QuestionCheckBox) {
      this.options = [];
      for (const option of this.schema.options) {
        const _option = new Option();

        _option.id = option.id_option;
        _option.points = Number(option.points);
        _option.label = option.label;
        _option.id_question = this.id;
        _option.order = option.order;

        this.options.push(_option);
      }
    } else if (this.schema instanceof QuestionRange) {
      const _range = this.schema.range;
      const _points = this.schema.max_points;
      const _multiplier = _points / _range;

      this.options = new Array(_range);

      for (let i = 0; i < this.options.length; i++) {
        const _order = i + 1;
        this.options[i] = new Option();

        this.options[i].points = _multiplier * _order;
        this.options[i].label = _order.toString();
        this.options[i].id_question = this.id;
        this.options[i].order = _order;
      }
    }
  }

  get questionSchema() {
    this.schema['reference'] = this.reference;
    this.schema['description'] = this.description;

    if (this.schema instanceof QuestionRadio || this.schema instanceof QuestionCheckBox) {
      const _options = [];
      this.options.forEach((option, index) => {
        const _option = new QuestionOption();

        _option.id_option = index;
        _option.points = Number(option.points);
        _option.label = option.label;
        _option.order = option.order;

        _options.push(_option);
      });
      this.schema.options = _options;
      this.max_points = this.schema.max_points;
    } else if (this.schema instanceof QuestionRange) {
      this.schema.range = this.options.length;
      this.max_points = this.schema.max_points = Math.max(...this.options.filter(option => option.points > 0).map(option => option.points), 0);
    }

    this._questionSchema = JSON.stringify(this.schema);
    return this._questionSchema;
  }
}

export interface RowQuestion {
  order: any[] | number;
  description: any[] | string;
  reference: any[] | string;
  area: any[] | Area;
  questionType: any[] | string;
  optionsNumber?: number;
  points?: any[];
  options?: Option[];
  block?: any | Block;
  id?: any[] | number;
}

export class Option extends Item {
  id: number;
  points: number;
  label: string;
  id_question: number;
  order: number;
}

export class RowOption {
  order: any | number;
  label: any[] | string;
  points: any[] | number;
  rateCount?: any[] | number;
  id?: number;

  constructor(order, label, points) {
    this.order = order;
    this.label = label;
    this.points = points;
  }
}
