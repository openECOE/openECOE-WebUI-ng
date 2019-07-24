import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Area, RowQuestion, Station} from '../../models';
import {Pagination} from '@openecoe/potion-client';
import {FunctionCall} from '@angular/compiler';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.less']
})
export class QuestionFormComponent implements OnInit {

  questionForm: FormGroup;
  control: FormArray;

  totalItems: number = 0;

  selectOptions: any [] = [];

  rowQuestion: RowQuestion = {
    order: [''],
    description: ['', Validators.required],
    reference: ['', Validators.required],
    area: [''],
    questionType: [''],
    optionsNumber: 0
  };

  data: object = {questionRow: [this.rowQuestion]};

  areas: Area[] = [];
  pagAreas: Pagination<Area>;

  questionTypeOptions: Array<{ type: string, label: string }> = [
    {type: 'RB', label: 'ONE_ANSWER'},
    {type: 'CH', label: 'MULTI_ANSWER'},
    {type: 'RS', label: 'VALUE_RANGE'}
  ];

  saved: boolean = false;

  func: any;

  @ViewChild('option') optionRef;


  @Output() returnData = new EventEmitter();

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.questionForm = this.fb.group({
      questionRow: this.fb.array([])
    });

    this.control = <FormArray>this.questionForm.controls.questionRow;

    this.addQuestionRow();

    this.loadAreas();
  }

  /**
   * Obtains de formControl instance of any element in our form.
   * @param name of the field, in our case can be 'name' or 'code'
   * @param idx the index of the field.
   */
  getFormControl(name: string, idx: number): AbstractControl {
    return this.questionForm.get('questionRow')['controls'][idx].controls[name];
  }

  searchInSelect(value: string, exclude?: string): void {
    if (value) {
      Station.query({
        where: {
          // 'ecoe': this.ecoeId,
          'name': {'$contains': value}
        },
        sort: {'order': false},
        page: 1,
        perPage: 50
      }, {paginate: true, cache: false})
        .then(response => {
          // this.updateOptions(response, exclude);
        });
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
    this.control.push(this.fb.group(this.rowQuestion));
    console.log('control: ', this.control);
  }

  addOptionRow(idx: number) { console.log('addOptionRow on index: ', idx);
    this.control.value[idx]['optionsNumber']++;
    // console.log('addOptionRow', this.rowQuestion.optionsNumber);
    console.log('optionsNumber', this.control.value[idx]['optionsNumber']);
  }

  async loadAreas() {
    // this.pagAreas = await Area.query<Area, Pagination<Area>>({where: {ecoe: this.idEcoe}, sort: {code: false}}, {paginate: true});
    this.pagAreas = await Area.query<Area, Pagination<Area>>({sort: {code: false}}, {paginate: true});
    this.areas = [...this.pagAreas['items']];
  }

  async loadMoreAreas() {
    const nextPage = this.pagAreas.page + 1;

    if (nextPage <= this.pagAreas.pages) {
      this.areas = [...this.areas, ...(await this.pagAreas.changePageTo(nextPage)).items];
    }
  }

  mySubmit() {
    console.log('submit from question form');
    return true;
  }

  onGetOptions(event: any) {
    console.log('onGetOptions', event);
  }

  /**
   * Before save values in data base, in first time checks that
   * all fields are validates and then will save the values.
   */
  submitForm(event?: any): boolean {
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
    console.log('question:submitForm: ', this.questionForm.valid);
    if (this.questionForm.valid) {

      // console.log('option: ', this.optionRef.submitForm());

      // this.optionRef.submitForm();

      if (event) {
        event();
      }


      this.returnData.next(this.questionForm.get('questionRow').value);
    }

    return this.questionForm.valid;
  }

  toSave(){
    this.saved = true;
  }

}
