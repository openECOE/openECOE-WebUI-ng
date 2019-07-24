import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {RowOption} from '../../models';
import {FormService} from '../../services/form/form.service';

@Component({
  selector: 'app-option-form',
  templateUrl: './option-form.component.html',
  styleUrls: ['./option-form.component.less']
})
export class OptionFormComponent implements OnInit, OnChanges {

  @Input() questionOrder: number;
  @Input() numberOptions: number;
  @Input() execSave: boolean;

  @Output() returnData = new EventEmitter();
  @Output() saveForm: EventEmitter<Function> = new EventEmitter();

  private current_number_options: number = 0;

  optionForm: FormGroup;
  control: FormArray;

  totalItems: number = 0;

  rowOption: RowOption = {
    order: [''],
    text: ['', Validators.required],
    points: ['', Validators.required]
  };

  // data: object = {optionRow: [this.rowOption]};

  constructor(private fb: FormBuilder, private formService: FormService) { }

  ngOnInit() {
    this.optionForm = this.fb.group({
      optionRow: this.fb.array([])
    });

    this.control = <FormArray>this.optionForm.controls.optionRow;

    // this.current_number_options = this.numberOptions;

    console.log(this.numberOptions, this.questionOrder);

  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('just changed value: ', changes);
    if (changes.numberOptions && changes.numberOptions.currentValue > 0) {
      this.addOptionRow(changes.numberOptions.currentValue);
    }
    if (changes.execSave && changes.execSave.currentValue === true) {
      this.saveForm.emit(this.submitForm);
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
  }

  /**
   * Adds new row (name and order fields) station to the form
   */
  addOptionRow(n_options: number) {
    console.log('addOptionRow');
    while (this.current_number_options < n_options) {
      this.control.push(this.fb.group(this.rowOption));
      this.current_number_options++;
    }
    // this.current_number_options = n_options;
  }

  submitForm() { console.log('options:submitForm:Run');
    for (const i in this.optionForm.get('optionRow')['controls']) {
      if (this.optionForm.get('optionRow')['controls'].hasOwnProperty(i)) {
        this.getFormControl('text', +i).markAsDirty();
        this.getFormControl('text', +i).updateValueAndValidity();

        this.getFormControl('points', +i).markAsDirty();
        this.getFormControl('points', +i).updateValueAndValidity();
      }
    }
    console.log('this.optionForm.valid', this.optionForm.valid);
    if (this.optionForm.valid) {
      // this.returnData.next(this.optionForm.get('optionRow').value);
      // this.saveForm.emit()
      this.formService.sendValues(this.optionForm.get('optionRow').value);
    }

    // return this.optionForm.valid;

    return this.submitForm;
  }

}
