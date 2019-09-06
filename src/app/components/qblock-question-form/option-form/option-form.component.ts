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

  @Output() returnData:   EventEmitter<any> = new EventEmitter();
  @Output() pointValues:  EventEmitter<any[]> = new EventEmitter();
  @Output() saveForm:     EventEmitter<Function> = new EventEmitter();

  private optionForm: FormGroup;
  private control: FormArray;

  private current_number_options: number = 0;
  private arrPoints: Array<{ option: number, value: number }> = [];
  private totalItems: number = 0;
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
     this.addOptionRow(this.numberOptions);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.numberOptions && !changes.numberOptions.firstChange) {
      if (changes.numberOptions.currentValue > 0) {
        this.addOptionRow(changes.numberOptions.currentValue);
      }
    } else if (changes.type && changes.type.currentValue && !changes.type.firstChange) {
      this.addOptionRow(this.numberOptions);
    } else {
      console.log('value changed: ', changes);
    }
  }

  getTotalPoints(n_option: number, $event: number) {
    const finded = this.arrPoints.find(item => item.option === n_option);

    if (finded) {
      finded.value = $event;
    } else {
      this.arrPoints.push({
        option: n_option,
        value: $event
      });
    }
    this.pointValues.next([this.questionOrder, this.arrPoints]);
  }

  updateTotalPoints(pos?: number) {
    if (pos || pos === 0) {
      this.arrPoints.splice(pos, 1);
    }
    this.pointValues.next([this.questionOrder, [...this.arrPoints]]);
  }

  getRowOption(rowType: string, defaultText?: string) {
    return <RowOption>({
      order: '',
      label: (rowType !== this.questionTypeOptions[2]) ? [defaultText, Validators.required] : [{value: ' ', disabled: true}, Validators.compose],
      points: ['', Validators.required]
    });
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
  }

  /**
   * Adds new row (name and order fields) station to the form
   */
  addOptionRow(n_options?: number) {
    if (this.type === this.questionTypeOptions[0]) {// RB
      // default values for RB
       while (this.current_number_options > 0) {
         this.updateTotalPoints(this.current_number_options - 1);
         this.deleteRow(this.current_number_options - 1);
         this.current_number_options--;
       }
      this.defaultTextValues.forEach((item) => {
        this.control.push(this.fb.group(this.getRowOption(this.type, item)));
        this.current_number_options++;
      });
    } else if (this.type === this.questionTypeOptions[1]) {/* CH */
        // FIRSTLY,  WE CHECK EVERY ROW IF HAS TOUCHED, IN TRUE CASE THE ROW WILL NOT BE REMOVED,
        // IN OTHER CASE, THE ROW WILL BE DELETED AND SUDDENLY WILL BE ADDED AS NEW.
        const i = 0; let k = 0;
        while (this.optionForm.get('optionRow')['controls'].length > 0) {
          if (this.optionForm.get('optionRow')['controls'].length === (k - 1)) {
            this.updateTotalPoints();
            break;
          } else if (this.getFormControl('label', +i).untouched && this.getFormControl('points', +i).untouched) {
            this.deleteRow(i);
            this.updateTotalPoints(i);
            this.current_number_options--;
          }
          k++;
        }
        while (this.current_number_options < n_options) {
          this.control.push(this.fb.group(this.getRowOption(this.type)));
          this.current_number_options++;
        }
    } else if (this.type === this.questionTypeOptions[2]) { // RS
      const i = 0;
      while (this.optionForm.get('optionRow')['controls'].length > 0) {
        // TODO: REVISE NEXT LINE
        if (this.optionForm.get('optionRow')['controls'].length === (i - 1)) {
          break;
        }
        this.deleteRow(i);
      }
      this.control.push(this.fb.group(this.getRowOption(this.type)));
    }
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
        options: this.optionForm.get('optionRow').value,
        valid: this.optionForm.valid
      });
    }
    return this.optionForm.valid;
  }
}
