import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {RowQblock} from '../../../pages/admin/ecoe/questions/questions.component';
import {QBlock} from '../../../models';

@Component({
  selector: 'app-qblock-form',
  templateUrl: './qblock-form.component.html',
  styleUrls: ['./qblock-form.component.less']
})
export class QblockFormComponent implements OnInit {

  @Output() returnData = new EventEmitter();
  @Input() qblocks?: QBlock;

  private qblockForm: FormGroup;
  private control: FormArray;

  private rowQblock: RowQblock = {
    name: ['', Validators.required]
  };

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.qblockForm = this.fb.group({
      qblockRow: this.fb.array([])
    });

    this.control = <FormArray>this.qblockForm.controls.qblockRow;

    this.InitQblockRow();
  }


  /**
   * Obtains de formControl instance of any element in our form.
   * @param name of the field, in our case can be 'name' or 'code'
   * @param idx the index of the field.
   */
  private getFormControl(name: string, idx: number): AbstractControl {
    return this.qblockForm.get('qblockRow')['controls'][idx].controls[name];
  }

  /**
   * Adds new row (name field) qblock to the form
   */
  private addQblockRow() {
     this.control.push(this.fb.group(this.rowQblock));
  }

  /**
   * Deletes selected row qblock whose was added previously
   * @param index id field to find and remove.
   */
  private deleteRow(index) {
    this.control.removeAt(index);
  }

  /**
   *At first time when OnInit, adds new qblock row;
   * in other cases resets the number of rows to 1 when the
   * form window was closed.
   */
  private InitQblockRow() {
    if (this.control.length === 0) {
      this.addQblockRow();
    } else {
      while (this.control.length > 1) {
        this.control.removeAt(1);
      }
      this.control.reset();
    }
  }

  /**
   * Before save values in data base, in first time checks that
   * all fields are validates and then will save the values.
   */
  submitForm(): boolean {
    for (const i in this.qblockForm.get('qblockRow')['controls']) {
      if (this.qblockForm.get('qblockRow')['controls'].hasOwnProperty(i)) {
        this.getFormControl('name', +i).markAsDirty();
        this.getFormControl('name', +i).updateValueAndValidity();
      }
    }
    const valid = this.qblockForm.valid;

    if (valid) {
      this.returnData.next(this.qblockForm.get('qblockRow').value);
    }
    return valid;
  }
}
