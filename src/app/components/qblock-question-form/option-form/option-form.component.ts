import {AfterContentInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {RowOption} from '../../../models';
@Component({
  selector: 'app-option-form',
  templateUrl: './option-form.component.html',
  styleUrls: ['./option-form.component.less']
})
export class OptionFormComponent implements OnInit, OnChanges, AfterContentInit {

  @Input() questionOrder: number;
  @Input() numberOptions: number;
  @Input() type: 'CH' | 'RS'  | 'RB';
  @Input() optionsCache: RowOption[] = [];

  @Output() returnData:   EventEmitter<any> = new EventEmitter();
  @Output() pointValues:  EventEmitter<any[]> = new EventEmitter();
  @Output() saveForm:     EventEmitter<Function> = new EventEmitter();

  private optionForm: FormGroup;
  private control: FormArray;

  private nRateCount: {max: number, min: number, current: number} = {
    max: 10,
    min: 1,
    current: 10
  };

  private current_number_options: number = 0;
  private arrPoints: Array<{ option: number, value: number }> = [];
  private defaultTextValues: string[] = ['Sí', 'No'];
  private questionTypeOptions: string[] = ['RB', 'CH', 'RS'];

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.optionForm = this.fb.group({
      optionRow: this.fb.array([])
    });
    this.control = <FormArray>this.optionForm.controls.optionRow;
  }

  ngAfterContentInit() {
     this.initOptionRow(this.numberOptions);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.numberOptions && !changes.numberOptions.firstChange) {
      if (changes.numberOptions.currentValue > 0) {
        if (this.type === this.questionTypeOptions[1]) {
          this.addOptionRow(this.type);
        } else {
          this.initOptionRow(changes.numberOptions.currentValue);
        }
      }
    } else if (changes.type && changes.type.currentValue && !changes.type.firstChange) {
      this.optionsCache = [];
      this.initOptionRow(this.numberOptions, changes.type.previousValue);
    }
  }

  getTotalPoints() {
    let i = 0;
    this.arrPoints = [];

    if (this.type === this.questionTypeOptions[2]) {
      const length = this.optionForm.get('optionRow')['controls'].length;
      if (!length) {
        return;
      }
      const points = this.optionForm.get('optionRow')['controls'][length - 1]['value']['points'];

      this.arrPoints.push({
        option: i,
        value: points,
      });
    } else {
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

  getRowOption(rowType: string, params: any, index?: number) {
    switch (rowType) {
      case 'RB':
        return <RowOption>({
          id: (params && params['id']) ? params['id'] : '',
          order: params ? params['order'] : '',
          label: [params ? params['label'] : this.defaultTextValues[index], [Validators.required, Validators.maxLength(255)]],
          points: [params ? params['points'] : '', [Validators.required, Validators.maxLength(2)]]
        });
      case 'CH':
        return <RowOption>({
          id: (params && params['id']) ? params['id'] : '',
          order: params ? params['order'] : '',
          label: [params ? params['label'] : '', [Validators.required, Validators.maxLength(255)]],
          points: [params ? params['points'] : '', [Validators.required, Validators.maxLength(2)]]
        });
      case 'RS':
        return <RowOption>({
          id: (params && params['id']) ? params['id'] : '',
          order: '',
          label: [{value: ' ', disabled: true}, ],
          points: [params ? params['points'] : '', [Validators.required, Validators.maxLength(2)]],
          rateCount: this.nRateCount.current
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
        // this.getTotalPoints();
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

  /**
   * Adds new row (name and order fields) station to the form
   */
  initOptionRow(n_options?: number, previusValue?: string) {
    if (this.type === this.questionTypeOptions[0]) {// RB
      this.initRBrow();
    } else if (this.type === this.questionTypeOptions[1]) {// CH
      this.initCHrow(n_options, previusValue);
    } else if (this.type === this.questionTypeOptions[2]) { // RS
      this.initRSrow();
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

  increaseRateCount(pos: number) {
    if (this.nRateCount.current < this.nRateCount.max) {
      this.nRateCount.current++;
      this.getFormControl('rateCount', pos).setValue(this.nRateCount.current);
    }
  }
  decreaseRateCount(pos: number) {
    if (this.nRateCount.current > this.nRateCount.min) {
      this.nRateCount.current--;
      this.getFormControl('rateCount', pos).setValue(this.nRateCount.current);
    }
  }

  parseOptions(options: RowOption[]) {
    const length = options.length;
    const rateCount = options[length - 1].rateCount;

    if (this.type !== 'RS') {
      return options;
    }
    const auxOptions: RowOption[] = [];
    let order;
    let points;
    for (let i = 0; i < rateCount; i++) {
      order = i + 1;
      points = parseInt(options[length - 1].points.toString(), 10);

      auxOptions.push( new RowOption(
        order,
        '',
        (points / rateCount) * order)
      );
    }
    return auxOptions;
  }
}
