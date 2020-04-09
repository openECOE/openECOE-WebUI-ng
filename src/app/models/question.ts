import {Item, Pagination, Route} from '@openecoe/potion-client';
import {Answer, Area, Station} from '@models/ecoe';
import {ItemFetchOptions, ItemQueryOptions} from '@openecoe/potion-client/core/item';
import {QueryParams} from '@openecoe/potion-client/core/potion';

// Question types

export class QuestionBase {
  constructor(type) {
    this.type = type;
  }

  readonly type: string;
  reference: string;
  description: string;
  protected _maxPoints: number;

  set max_points(value) {
    this._maxPoints = value;
  }

  get max_points() {
    return this._maxPoints;
  }

}

export class QuestionOption {
  id_option: number;
  points: number;
  label: string;
  order: number;
}

export class QuestionRadio extends QuestionBase {
  constructor() {
    super('radio');
    this.options = [];
  }

  set max_points(points: number) {
    // Recalculate options points, for radio assigns max points to value with max points
    const _option: QuestionOption = this.options.reduce((a, b) => (a.points > b.points) ? a : b);
    _option.points = points;
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
    // Recalculate options points, for checkbox distribute points in options based on option weight
    const diffPoints = (this.max_points / points);
    this.options.map(option => option.points = option.points * diffPoints);
  }

  options: QuestionOption[];

  get max_points() {
    // Calculate max points with the high value
    return this.options.filter(option => option.points > 0).map(option => option.points).reduce((a, b) => a + b, 0);
  }
}

export const MaxPointsRangeError = new Error('max points should be positive in Range question');

export class QuestionRange extends QuestionBase {
  constructor() {
    super('range');
    this.range = 0;
  }

  range: number;

  // Points in range only could be positive
  set max_points(value: number) {
    if (value >= 0) {
      this._maxPoints = value;
    } else {
      throw MaxPointsRangeError;
    }
  }

  get max_points() {
    return this._maxPoints;
  }
}

export const QuestionType: any = {
  'radio': {class: QuestionRadio, label: 'ONE_ANSWER'},
  'checkbox': {class: QuestionCheckBox, label: 'MULTI_ANSWER'},
  'range': {class: QuestionRange, label: 'VALUE_RANGE'}
};

export class QuestionSchema {
  constructor(className: string, opts?: any) {
    if (QuestionType[className] === undefined || QuestionType[className] === null) {
      throw new Error(`Class type of \'${className}\' is not in the store`);
    }
    return new QuestionType[className]['class'](opts);
  }
}

export class NewQuestion extends Item {
  id: number;
  area: Area;
  station: Station;
  order: number;
  block?: QBlock;
  _questionSchema: string;
  schema: QuestionSchema;
  // question: QuestionRadio | QuestionCheckBox | QuestionRange;
  maxPoints: number;

  answers = Route.GET<Answer>('/answers');

  // fetch(id: number | string, options?: ItemFetchOptions): Promise<this> {
  //   return new Promise<this>((resolve, reject) => {
  //     super.fetch(id).then(value => {
  //       const qparse = JSON.parse(value.question_schema);
  //       if (qparse.type === 'radio') {
  //         value.question = Object.assign(new QuestionRadio(), value.question_schema);
  //       }
  //       resolve(value);
  //     }).catch(reason => reject(reason));
  //   });
  // }

  set questionSchema(schema: string) {
    this._questionSchema = schema;
    const _schema = JSON.parse(schema);
    this.schema = Object.assign(new QuestionSchema(_schema.type), _schema);
  }

  get questionSchema() {
    this._questionSchema = JSON.stringify(this.schema);
    return this._questionSchema;
  }
}

export interface IQuestion {
  id?: any[] | number;
  area: any[] | Area;
  station: any[] | Station;
  order: any[] | number;
  block?: any[] | QBlock;
  schema: any[] | QuestionSchema;
  maxPoints?: any[];
}

export class QBlock extends Item {
  id: number;
  name: string;
  order: number;

  station: Station;
  questions = Route.GET<Pagination<Question>>('/questions');
}

export interface RowQblock {
  name: any[];
}


// Old

export class QBlockOld extends Item {
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

  get getPoints() {
    return this.maxPoints;
  }

  // New API Question model
  block: QBlock;
  _questionSchema: string;
  schema: QuestionSchema;
  maxPoints: number;

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

        // _option.id = option.id_option;
        _option.points = option.points;
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
    this.schema['type'] = this.questionType;

    if (this.schema instanceof QuestionRadio || this.schema instanceof QuestionCheckBox) {
      const _options = [];
      this.options.forEach((option, index) => {
        const _option = new QuestionOption();

        _option.id_option = index;
        _option.points = option.points;
        _option.label = option.label;
        _option.order = option.order;

        _options.push(_option);
      });
      this.schema.options = _options;
      this.maxPoints = this.schema.max_points;
    } else if (this.schema instanceof QuestionRange) {
      this.schema.range = this.options.length;
      this.maxPoints = this.schema.max_points = Math.max(...this.options.filter(option => option.points > 0).map(option => option.points), 0);
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
