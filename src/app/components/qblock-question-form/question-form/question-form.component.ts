import {Component, EventEmitter, OnInit, Output, QueryList, ViewChildren} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Area, RowQuestion, Station} from '../../../models';
import {Pagination} from '@openecoe/potion-client';

import {OptionFormComponent} from '../option-form/option-form.component';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.less'],
  providers: [OptionFormComponent]
})
export class QuestionFormComponent implements OnInit {

  @ViewChildren(OptionFormComponent) optionsRef: QueryList<OptionFormComponent>;
  @Output() returnData = new EventEmitter();

  questionForm: FormGroup;
  control: FormArray;
  totalItems: number = 0;
  totalPoints: number = 0;
  areas: Area[] = [];
  pagAreas: Pagination<Area>;

  questionTypeOptions: Array<{ type: string, label: string }> = [
    {type: 'RB', label: 'ONE_ANSWER'},
    {type: 'CH', label: 'MULTI_ANSWER'},
    {type: 'RS', label: 'VALUE_RANGE'}
  ];

  data: object = {questionRow: [this.getRowQuestion()]};
  selectedQType: string = this.questionTypeOptions[0].type;


  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.questionForm = this.fb.group({
      questionRow: this.fb.array([])
    });

    this.control = <FormArray>this.questionForm.controls.questionRow;

    this.addQuestionRow();

    this.loadAreas().finally( () => this.getFormControl('area', 0 ).setValue(this.areas[0])  );
  }

  /**
   * Obtains de formControl instance of any element in our form.
   * @param name of the field, in our case can be 'name' or 'code'
   * @param idx the index of the field.
   */
  getFormControl(name: string, idx: number): AbstractControl {
    return this.questionForm.get('questionRow')['controls'][idx].controls[name];
  }

  getRowQuestion() {
    return <RowQuestion>({
      order: [''],
      description: ['', Validators.required],
      reference: ['', Validators.required],
      area: [(this.areas) ? this.areas[0] : '', Validators.required],
      questionType: [this.questionTypeOptions[0].type, Validators.required],
      optionsNumber: 2, // BECAUSE RB QUESTION TYPE IS BY DEFAULT.
      points: [{value: 0, disabled: true}, Validators.required]
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
    } else {
      // this.loadOptions4Select(exclude);
    }
  }

  /**
   * Deletes selected row area whose was added previously
   * @param index id field to find and remove.
   */
  deleteRow(index) {
    this.control.removeAt(index);
  }

  /**
   * Adds new row (name and order fields) station to the form
   */
  addQuestionRow() {
    this.control.push(this.fb.group(this.getRowQuestion()));
  }

  addOptionRow(idx: number) {
    this.control.value[idx]['optionsNumber']++;
  }

  async loadAreas() {
    this.pagAreas = await Area.query<Area, Pagination<Area>>({sort: {code: false}}, {paginate: true});
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

    questions[event.id].order = event.id;
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

      if (!formValidFlag) { return; }

      this.returnData.next((this.questionForm.get('questionRow').value).map((item) => {
        item['order'] += 1;
        return item;
      }));
    }

    return this.questionForm.valid;
  }

  onQuestionTypeChange(event: string) {
    this.selectedQType = event;
  }

  onReceivePointValues($event: any[]) {
    this.totalPoints = 0;
    const questionOrder = $event[0];
    const questionType = this.control.value[questionOrder]['questionType'];
    switch (questionType) {
      case this.questionTypeOptions[0].type: { // RB
        this.control.value[questionOrder]['points'] = ($event[1].length > 0) ? Math.max(...(Array.from( $event[1], x => x['value'] ))) : 0;
        break;
      }
      case this.questionTypeOptions[1].type: { // CH
        $event[1].forEach(item => {
          this.totalPoints += parseInt(item.value, 10);
          this.control.value[questionOrder]['points'] = this.totalPoints;
        });
        break;
      }
      case this.questionTypeOptions[2].type: {
        $event[1].forEach(item => {
          this.totalPoints += parseInt(item.value, 10);
          this.control.value[questionOrder]['points'] = this.totalPoints;
        });
        break;
      }
    }
  }
}
