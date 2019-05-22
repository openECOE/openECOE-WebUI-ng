import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../../services/api/api.service';
import {ActivatedRoute} from '@angular/router';
import {SharedService} from '../../../../services/shared/shared.service';
import {Area, RowArea, Student} from 'src/app/models/ecoe';
import {valueFunctionProp} from 'ng-zorro-antd';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

/**
 * Component with students.
 */
@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.less']
})
export class StudentsComponent implements OnInit {

  students: any[] = [];
  ecoeId: number;
  editCache = {};
  index: number = 1;

  addStudentDraw: boolean = false;

  current_page: number = 1;
  per_page: number = 10;
  totalItems: number = 0;

  studentRow = {
    dni: ['', Validators.required],
    name: ['', Validators.required],
    surnames: ['', Validators.required]
  };

  studentForm: FormGroup;
  studentControl: FormArray;

  logPromisesERROR: { value: any, reason: any }[] = [];
  logPromisesOK: any[] = [];

  loading: boolean = false;

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private shared: SharedService,
              private fb: FormBuilder,
              private translate: TranslateService) {

    this.studentForm = this.fb.group({
      studentRow: this.fb.array([])
    });

    this.studentControl = <FormArray>this.studentForm.controls.studentRow;
  }

  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;
    this.loadStudents();
  }

  /**
   * Load students by the passed ECOE.
   * Then calls [updateEditCache]{@link #updateEditCache} function.
   */
  loadStudents() {
    this.loading = true;

    Student.query({
      where: {ecoe: this.ecoeId},
      sort: {surnames: false, name: false}
    }, {cache: false})
      .then(response => {
        this.editCache = {};
        this.students = response;
        this.updateEditCache();
      })
      .finally(() => this.loading = false);
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayStudents]{@link #updateArrayStudents} function.
   *
   * @param student Resource selected
   */
  deleteItem(student: any) {
    this.apiService.deleteResource(student['$uri']).subscribe(() => {
      this.updateArrayStudents(student.id);
    });
  }

  /**
   * Sets the editCache variable to true.
   * Changes text-view tags by input tags.
   *
   * @param id Id of the selected resource
   */
  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  /**
   * Sets the editCache variable to false.
   * If resource is not already saved, calls [updateArrayStudents]{@link #updateArrayStudents} function.
   * Else resets editCache to the previous value.
   *
   * @param student Resource selected
   */
  cancelEdit(student: any): void {
    this.editCache[student.id].edit = false;

    if (this.editCache[student.id].new_item) {
      this.updateArrayStudents(student.id);
    } else {
      this.editCache[student.id] = student;
    }
  }

  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   *
   * @param student Resource selected
   * @param newItem determines if the resource is already saved
   */
  saveItem(student: any, newItem: boolean) {
    const item = this.editCache[student.id];

    if (!item.dni || !item.surnames || !item.name) {
      return;
    }

    const body = {
      dni: item.dni,
      surnames: item.surnames,
      name: item.name,
      ecoe: this.ecoeId
    };

    const request = (
      newItem ?
        this.apiService.createResource('student', body) :
        this.apiService.updateResource(item['$uri'], body)
    );

    request.subscribe(response => {
      delete this.editCache[student.id];
      delete this.editCache[response['id']];

      this.editCache[response['id']] = {
        edit: false,
        ...response
      };

      this.students = this.students.map(x => (x.id === student.id) ? response : x);
    });
  }

  /**
   * Adds a new empty field to the resources array.
   * Then updates editCache with the new resource.
   */
  addStudent() {
    this.apiService.getResources('student')
      .subscribe(students => {
        this.index += this.shared.getLastIndex(students);

        const newItem = {
          id: this.index,
          dni: '',
          surnames: '',
          name: '',
          ecoe: this.ecoeId
        };

        this.students = [...this.students, newItem];

        this.editCache[this.index] = {
          edit: true,
          new_item: true,
          ...newItem
        };
      });
  }

  /**
   * Updates editCache variable with the same values of the resources array and adds a 'edit' key.
   */
  updateEditCache(): void {
    this.students.forEach(item => {
      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        ...item
      };
    });
  }

  /**
   * Deletes the editCache key assigned to the resource id passed and filters out the item from the resources array.
   *
   * @param studentId Id of the resource passed
   */
  updateArrayStudents(studentId: number) {
    delete this.editCache[studentId];
    this.students = this.students.filter(x => x.id !== studentId);
  }

  /**
   * Adds new row (name and code fields) area to the form
   */
  addStudentRow() {
    this.studentControl.push(this.fb.group(this.studentRow));
  }

  /**
   *At first time when OnInit, adds new area row;
   * in other cases resets the number of rows to 1 when the
   * form window was closed.
   */
  InitAreaRow() {
    if (this.studentControl.length === 0) {
      this.addStudentRow();
    } else {
      while (this.studentControl.length > 1) {
        this.studentControl.removeAt(1);
      }
      this.studentControl.reset();
    }
  }

  /**
   * Opens form window to add new area/s
   */
  showDrawer() {
    this.addStudentDraw = true;
  }

  /**
   * Closes the form area window
   */
  closeDrawer() {
    this.addStudentDraw = false;
  }

  /**
   * When user decides do not save the form values and
   * close the form window: will close the drawer window
   * and reset the number of row areas.
   */
  cancelForm() {
    this.closeDrawer();
    this.InitAreaRow();
  }


  newStudent(dni: string,
             name: string,
             surnames: string,
             plannerOrder?: number): Promise<any> {

    const student = new Student();

    student.ecoe = this.ecoeId;
    student.dni = dni.toString();
    student.name = name;
    student.surnames = surnames;
    student.plannerOrder = plannerOrder ? plannerOrder : null;

    return student.save();

  }

  saveStudents(items: any[]): Promise<any> {
    const savePromises = [];
    this.logPromisesERROR = [];
    this.logPromisesOK = [];

    const noItem = {
      statusText: 'no Item',
      message: this.translate.instant('INVALID_ITEM')
    };

    for (const item of items) {
      if (item.dni && item.name && item.surnames) {

        savePromises.push(
          this.newStudent(item.dni, item.name, item.surnames)
            .then(result => {
              this.logPromisesOK.push(result);
              return result;
            })
            .catch(err => {
              this.logPromisesERROR.push({
                value: item,
                reason: err
              });
              return err;
            })
        );
      } else {
        this.logPromisesERROR.push({
          value: item,
          reason: noItem
        });
      }
    }

    return Promise.all(savePromises)
      .then(() =>
        new Promise((resolve, reject) =>
          this.logPromisesERROR.length > 0 ? reject(this.logPromisesERROR) : resolve(items)))
      .catch(err => new Promise(((resolve, reject) => reject(err))));
  }

  /**
   * Method for import students values from file.
   * @param parserResult values that was readed from file.
   */
  importStudents(parserResult: Array<any>) {
    this.saveStudents(parserResult)
      .then(() => {
        this.loadStudents();
      })
      .catch(err => {
        console.error('save ERROR: ', err);
      });
  }

  /**
   * Resets the array of promise errors when tried to save on
   * data base.
   */
  clearImportErrors() {
    this.logPromisesERROR = [];
  }

  /**
   * Obtains de formControl instance of any element in our form.
   * @param name of the field, in our case can be 'name' or 'code'
   * @param idx the index of the field.
   */
  getFormControl(name: string, idx: number): AbstractControl {
    return this.studentForm.get('studentRow')['controls'][idx].controls[name];
  }

  /**
   * Before save values in data base, in first time checks that
   * all fields are validates and then will save the values.
   */
  submitForm(): void {
    this.shared.dirtForm(this.studentForm);

    if (this.studentForm.valid) {
      this.saveStudents(this.studentForm.get('areaRow').value)
        .finally(() => {
          this.loadStudents();
          this.closeDrawer();
          this.InitAreaRow();
          this.shared.cleanForm(this.studentForm);
        });
    }
  }

}
