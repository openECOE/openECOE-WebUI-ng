import {AfterContentInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {QuestionCheckBox, QuestionGrid, QuestionOption, QuestionRadio, QuestionRange, QuestionSchema, RowOption} from '@app/models';
import {stringify} from 'querystring';
@Component({
  selector: 'app-option-form',
  templateUrl: './option-form.component.html',
  styleUrls: ['./option-form.component.less']
})
export class OptionFormComponent implements OnInit, OnChanges, AfterContentInit {

  @Input() questionOrder: number;
  @Input() type: 'radio' | 'checkbox'  | 'range' | 'grid';
  @Input() schema: QuestionSchema;

  @Output() returnData:   EventEmitter<any> = new EventEmitter();
  @Output() pointValues:  EventEmitter<any[]> = new EventEmitter();
  @Output() saveForm:     EventEmitter<Function> = new EventEmitter();

  optionForm: FormGroup;
  control: FormArray;
  optionsCache: RowOption[] = [];

  nRateCount: {max: number, min: number, current: number} = {
    max: 10,
    min: 1,
    current: 10
  };
/*
  nGridRows: {max: number, min: number, current: number} ={
    min: 1,
    current: 1,
    max: 1
  };*/

  current_number_options: number = 0;
  arrPoints: Array<{ option: number, value: number }> = [];
  defaultTextValues: string[] = ['Sí'];
  public questionTypeOptions: string[] = ['radio', 'checkbox', 'range', 'grid'];

  constructor(
    private fb: FormBuilder) { }

  ngOnInit() {
    this.initOptionsCache();
    this.initOptionForm();
  }

  ngAfterContentInit() {
    this.initOptionRow();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.type && changes.type.currentValue && !changes.type.firstChange) {
      if (changes.type.currentValue === 'RS') {
        this.optionsCache = [];
        this.initOptionRow(changes.type.previousValue);
      } else if (changes.type.previousValue === 'RS') {
        this.initOptionRow(changes.type.previousValue);
      }
      this.getTotalPoints();
    }
  }

  initOptionsCache() {
    if ( this.schema instanceof QuestionRadio || this.schema instanceof QuestionCheckBox
      || this.schema instanceof QuestionGrid ) {
      this.schema.options = this.schema.options.map(option => {
        const _option = new QuestionOption()
        _option.id_option = option.id_option
        _option.label = option.label
        _option.order = option.order
        _option.points = Number(option.points)
        return _option
      })
      this.optionsCache = this.schema.options;
    } else if (this.schema instanceof QuestionRange) {
      const _rOption = new RowOption(0, null, this.schema.max_points)
      _rOption.rateCount = this.schema.range;
      this.optionsCache = [_rOption];
    }
  }

  initOptionForm() {
    this.optionForm = this.fb.group({
      optionRow: this.fb.array([])
    });
    this.control = <FormArray>this.optionForm.controls.optionRow;
  }

  getTotalPoints() {
    let i = 0;
    this.arrPoints = [];

    if (this.type === this.questionTypeOptions[2]) { //RS
      const length = this.optionForm.get('optionRow')['controls'].length;
      if (!length) {
        return;
      }
      const points = this.optionForm.get('optionRow')['controls'][length - 1]['value']['points'];

      this.arrPoints.push({
        option: i,
        value: points,
      });
    } else {                                        //RB,CH,GRID
      for (const item of (this.optionForm.get('optionRow')['controls'])) {
        this.arrPoints.push({
          option: i,
          value: item.value.points
        });
        i++;
      }
    }

    this.pointValues.next([this.questionOrder, this.arrPoints]);
  }

  updateTotalPoints(pos?: number) {
    if (pos || pos === 0) {
      this.arrPoints.splice(pos, 1);
    }
    this.pointValues.next([this.questionOrder, [...this.arrPoints]]);
  }

  /*
  * Obtain a RowOption instance 
  * @param rowType 
  * @param params
  * @param index 
  */
  getRowOption(rowType: string, params: any, index?: number) {
    if (rowType !== this.questionTypeOptions[2]) {  //RB,CH,GRID
      return <RowOption>({
        id: (params && params['id']) ? params['id'] : '',
        order: params ? params['order'] : '',
        label: [params ? params['label'] : this.defaultTextValues[index], [Validators.required, Validators.maxLength(255)]],
        points: [params ? params.points : '', [Validators.required, Validators.maxLength(2)]]
      });
    } else {
      return <RowOption>({  //RS
        id: (params && params['id']) ? params['id'] : '',
        order: '',
        label: [{value: ' ', disabled: true}, ],
        points: [params ? params.points : null, [Validators.required]],
        rateCount: [params ? params.rateCount : 10, [Validators.required]]
      });
    }
  }

  /**
   * Obtains de formControl instance of any element in our form.
   * @param name of the field, in our case can be 'name' or 'code'
   * @param idx the index of the field.
   */
  getFormControl(name: string, idx: number): AbstractControl {
    return this.optionForm.get('optionRow')['controls'][idx].controls[name];
  }

  /**
   * Deletes selected row area whose was added previously
   * @param index id field to find and remove.
   */
  deleteRow(index) {
    this.control.removeAt(index);
    this.current_number_options--;
    this.getTotalPoints();
  }

  initRBrow() {
    while (this.current_number_options > 0) {
      this.deleteRow(this.current_number_options - 1);

    }
    if (this.optionsCache && this.optionsCache.length > 0) {
      this.optionsCache.forEach((item, idx) => {
        this.addOptionRow(this.type, item, idx);
      });
    } else {
      this.defaultTextValues.forEach((item, idx) => {
        this.addOptionRow(this.type, null, idx);
      });
    }
  }
  initCHrow(n_options: number = 2, previousValue: string) {
    // FIRSTLY,  WE CHECK EVERY ROW IF HAS TOUCHED, IN TRUE CASE THE ROW WILL NOT BE REMOVED,
    // IN OTHER CASE, THE ROW WILL BE DELETED AND SUDDENLY WILL BE ADDED AS NEW.
    const i = 0; let k = 0;
    while (this.optionForm.get('optionRow')['controls'].length > 0) {
      if (this.optionForm.get('optionRow')['controls'].length === (k - 1)) {
        this.updateTotalPoints();
        break;
      } else if (previousValue === this.questionTypeOptions[2]
        || (this.getFormControl('label', +i).untouched
              && this.getFormControl('points', +i).untouched
                && previousValue !== this.questionTypeOptions[2]) ) {

                  this.deleteRow(i);
      }
      k++;
    }
    if (this.optionsCache && this.optionsCache.length > 0) {
      this.optionsCache.forEach(item => {
        this.control.push(this.fb.group(this.getRowOption(this.type, item)));
        this.current_number_options++;
        this.getTotalPoints();
      });
    } else {
      while (this.current_number_options < n_options) {
        this.control.push(this.fb.group(this.getRowOption(this.type, null)));
        this.current_number_options++;
      }
    }
  }

  initRSrow() {
    while (this.optionForm.get('optionRow')['controls'].length > 0) {
      if (this.optionForm.get('optionRow')['controls'].length === 0) {
        break;
      }
      this.deleteRow(0);
    }
    if (this.optionsCache && this.optionsCache.length > 0) {
      this.nRateCount.current = this.optionsCache.length;
      this.optionsCache.forEach(item => {
        this.addOptionRow(this.type, item);
      });
    } else {
      this.nRateCount.current = this.nRateCount.max;
      this.addOptionRow(this.type, null);
    }
  }

  //Initialize the grid question form
  initGRIDrow(){
    //
    while (this.current_number_options > 0) {
      this.deleteRow(this.current_number_options - 1);
    }
    
    if (this.optionsCache && this.optionsCache.length > 0) {
      this.optionsCache.forEach((item, idx) => {
        this.addOptionRow(this.type, item, idx);
      });
    } else {
      this.defaultTextValues.forEach((item, idx) => {
        this.addOptionRow(this.type, null, idx);
      });
    }
  }

  /**
   * Adds new row (name and order fields) station to the form
   */
  initOptionRow(prevValue?: string) {
    const DEFAULT_N_CH_ROWS = 2;

    if (this.type === this.questionTypeOptions[0]) {// RB
      this.initRBrow();
    } else if (this.type === this.questionTypeOptions[1]) {// CH
      this.initCHrow(DEFAULT_N_CH_ROWS, prevValue);
    } else if (this.type === this.questionTypeOptions[2]) { // RS
      this.initRSrow();
    } else if (this.type === this.questionTypeOptions[3]){ // Grid
      this.initGRIDrow();
    }
  }

  addOptionRow(type: string, item: any = null, index?: number) {
    this.control.push(this.fb.group(this.getRowOption(type, item, index)));
    this.current_number_options++;
    this.getTotalPoints();
  }


  submitForm() {
    for (const i in this.optionForm.get('optionRow')['controls']) {
      if (this.optionForm.get('optionRow')['controls'].hasOwnProperty(i)) {
        this.getFormControl('label', +i).markAsDirty();
        this.getFormControl('label', +i).updateValueAndValidity();

        this.getFormControl('points', +i).markAsDirty();
        this.getFormControl('points', +i).updateValueAndValidity();
      }
    }
    if (this.optionForm.valid) {
      const options: RowOption[] = this.optionForm.get('optionRow').value;

      for (let i = 0; i < options.length; i++) {
        options[i].order = i + 1;
      }
      this.returnData.next({
        id: this.questionOrder,
        options: this.parseOptions(this.optionForm.get('optionRow').value),
        valid: this.optionForm.valid
      });
    }
    return this.optionForm.valid;
  }

  increaseRateCount(pos: number, value: number) {
    if (value < this.nRateCount.max) {
      this.nRateCount.current = ++value;
      this.getFormControl('rateCount', pos).setValue(this.nRateCount.current);
    }
  }
  decreaseRateCount(pos: number, value: number) {
    if (value > this.nRateCount.min) {
      this.nRateCount.current = --value;
      this.getFormControl('rateCount', pos).setValue(this.nRateCount.current);
    }
  }

  /** function in order to check de grid rows number is not higher
    * than added answers for the current question
    */
  /*increaseGridRowsCount(pos: number, value: number) {
    
  }*/

  parseOptions(options: RowOption[]) {    
    return options;
  }
}
