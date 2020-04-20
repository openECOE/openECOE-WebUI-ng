import {Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Area, Block, Question, QuestionSchema, RowQuestion, Station} from '@app/models';
import {Pagination} from '@openecoe/potion-client';

import {OptionFormComponent} from '../option-form/option-form.component';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.less'],
})
export class QuestionFormComponent implements OnInit, OnChanges {

  @ViewChildren(OptionFormComponent) optionsRef: QueryList<OptionFormComponent>;

  @Input()  questionsCache: Question[] = [];
  @Input()  qblock: {block: Block, lastOrder: number};
  @Input()  formVisible: boolean = false;
  @Input()  action: 'ADD' | 'EDIT' | 'ADD_WITH_QBLOCK';
  @Output() returnData: EventEmitter<any> = new EventEmitter();

  questionForm: FormGroup;
  private control: FormArray;
  private totalItems: number = 0;
  private totalPoints: number = 0;
  private areas: Area[] = [];
  private pagAreas: Pagination<Area>;
  private ecoeId: number;

  public questionTypeOptions: Array<{ type: string, label: string }> = [
    {type: 'radio', label: 'ONE_ANSWER'},
    {type: 'checkbox', label: 'MULTI_ANSWER'},
    {type: 'range', label: 'VALUE_RANGE'}
  ];

  private selectedQType: string = this.questionTypeOptions[0].type;

  private defaultQuestion: Question = new Question({schema: new QuestionSchema('radio')});


  constructor(private fb: FormBuilder,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.ecoeId = this.route.snapshot.parent.params.ecoeId;
    this.questionForm = this.fb.group({
      questionRow: this.fb.array([])
    });

    this.control = <FormArray>this.questionForm.controls.questionRow;

    this.initRowQuestions(this.questionsCache);

    this.loadAreas().finally();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.questionsCache && changes.questionsCache.currentValue.length > 0) {
      this.resetFormValues(this.questionsCache);
    } else if (changes.formVisible && !changes.formVisible.currentValue) {
      this.resetFormValues();
    }
  }

  resetFormValues(questions?: Question[]) {
    if (this.questionForm) {
      const form = this.questionForm.get('questionRow')['controls'];
      for (const i in form) {
        if (form.hasOwnProperty(i)) {
          this.deleteRow(i);
        }
      }
      if (this.control) {
        this.control.reset();
        this.initRowQuestions(questions);
      }
    }
  }

  /**
   * Obtains de formControl instance of any element in our form.
   * @param name of the field, in our case can be 'name' or 'code'
   * @param idx the index of the field.
   */
  getFormControl(name: string, idx: number): AbstractControl {
    const form = this.questionForm.get('questionRow');
    return (form && form['controls'][idx]) ? form['controls'][idx].controls[name] : null;
  }

  initRowQuestions(questions?: Question[]) {
    if (questions && questions.length > 0) {
      questions.forEach(item => {
        this.addQuestionRow(item);
      });
    } else if (this.control.controls.length === 0) {
      this.addQuestionRow(this.defaultQuestion);
    }
  }

  getRowQuestion(params = {}) {
    return <RowQuestion>({
      order:
        parseInt(params['order'], 10)
      ,
      description: [
        params['schema']['description'],
        [
          Validators.required,
          Validators.maxLength(500)
        ]
      ],
      reference: [
        params['schema']['reference'],
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],
      area: [
        (params['area'] ? params['area'] : null),
        Validators.required
      ],
      questionType: [
        (params['schema']['type'] ? params['schema']['type'] : null),
        Validators.required
      ],
      points: [
        {value: 0, disabled: false},
        Validators.required
      ],
      block: [ (params['block'] ? params['block'] : null), ],
      id: [ (params['id'] ? params['id'] : null)]
    });
  }

  searchInSelect(value: string): void {
    if (value) {
      Station.query({
        where: {
          'name': {'$contains': value}
        },
        sort: {'order': false},
        page: 1,
        perPage: 50
      }, {paginate: true, cache: false})
        .finally();
    }
  }

  /**
   * Deletes selected row area whose was added previously
   * @param index id field to find and remove.
   */
  deleteRow(index) {
    const form = this.questionForm.get('questionRow')['controls'];
    if (form && form.length > 0) {
      this.control.removeAt(index);
    }
  }

  /**
   * Adds new row (name and order fields) station to the form
   */
  addQuestionRow(params?: any) {
    if (this.control) {
      this.control.push(this.fb.group(this.getRowQuestion(params)));
    }
  }

  async loadAreas() {
    this.pagAreas = await Area.query<Area, Pagination<Area>>({where: {ecoe: +this.ecoeId}, sort: {code: false}}, {paginate: true});
    this.areas = [...this.pagAreas['items']];
  }

  async loadMoreAreas() {
    const nextPage = this.pagAreas.page + 1;
    if (nextPage <= this.pagAreas.pages) {
      this.areas = [...this.areas, ...(await this.pagAreas.changePageTo(nextPage)).items];
    }
  }

  onGetOptions(event: any) {
    const questions = this.questionForm.get('questionRow').value;
    questions[event.id].options = event.options;
  }

  /**
   * Before save values in data base, in first time checks that
   * all fields are validates and then will save the values.
   */
   submitForm(): boolean {
    for (const i in this.questionForm.get('questionRow')['controls']) {
      if (this.questionForm.get('questionRow')['controls'].hasOwnProperty(i)) {
        this.getFormControl('description', +i).markAsDirty();
        this.getFormControl('description', +i).updateValueAndValidity();

        this.getFormControl('reference', +i).markAsDirty();
        this.getFormControl('reference', +i).updateValueAndValidity();

        this.getFormControl('area', +i).markAsDirty();
        this.getFormControl('area', +i).updateValueAndValidity();

        this.getFormControl('area', +i).markAsDirty();
        this.getFormControl('area', +i).updateValueAndValidity();

        this.getFormControl('questionType', +i).markAsDirty();
        this.getFormControl('questionType', +i).updateValueAndValidity();
      }
    }

    if (this.questionForm.valid) {
      let formValidFlag: boolean = true;

      this.optionsRef.toArray().forEach((item) => {
        if (!item.submitForm()) {
          formValidFlag = false;
          return;
        }
      });

      if (!formValidFlag) {
        return;
      }

      const auxQuestions = this.questionForm.get('questionRow').value.map((item, idx) => {
      if (this.qblock && this.qblock.lastOrder) {
        if (!item.order || item.order < 1) {
          item.order = this.qblock.lastOrder + (idx + 1);
        }
      } else {
        item.order = (idx + 1);
      }
        return item;
      });

      this.returnData.emit(auxQuestions);
    }

    return this.questionForm.valid;
  }

  onQuestionTypeChange(event: string) {
    if (event) {
      this.selectedQType = event;
    }
  }

  onReceivePointValues($event: any[]) {
    this.totalPoints = 0;
    const questionOrder = $event[0];
    const questionType = this.control.value[questionOrder]['questionType'];
    switch (questionType) {
      case this.questionTypeOptions[0].type: { // RB
        this.totalPoints = ($event[1].length > 0) ? Math.max(...(Array.from( $event[1], x => x['value'] ))) : 0;
        this.getFormControl('points', $event[0]).setValue(this.totalPoints);
        break;
      }
      case this.questionTypeOptions[1].type: { // CH
        $event[1].forEach(item => {
          this.totalPoints += parseInt(item.value ? item.value : 0, 10);
          this.getFormControl('points', $event[0]).setValue(this.totalPoints);
        });
        break;
      }
      case this.questionTypeOptions[2].type: {
        $event[1].forEach(item => {
          this.totalPoints += parseInt(item.value ? item.value : 0, 10);
          this.getFormControl('points', $event[0]).setValue(this.totalPoints);
        });
        break;
      }
    }
  }
}
