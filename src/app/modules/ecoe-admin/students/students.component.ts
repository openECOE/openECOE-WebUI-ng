import {Component, OnInit} from '@angular/core';
import {ApiService} from '@services/api/api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {SharedService} from '@services/shared/shared.service';
import {Student, ECOE} from 'app/models/ecoe';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {Pagination} from '@openecoe/potion-client';
import {Planner, Round, Shift} from '../../../models';
import {STUDENTS_TEMPLATE_URL} from '@constants/import-templates-routes';
import { NzMessageService } from 'ng-zorro-antd';

/**
 * Component with students.
 */
@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.less']
})
export class StudentsComponent implements OnInit {
  readonly STUDENTS_URL = STUDENTS_TEMPLATE_URL;
  students: Student[] = [];
  ecoeId: number;
  ecoe: ECOE;
  ecoe_name: String;
  editCache = {};
  index: number = 1;

  addStudentDraw: boolean = false;

  page: number = 1;
  perPage: number = 20;
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

  checked = false;
  indeterminate = false;

  setOfCheckedId = new Set<Student>();

  mapOfSort: { [key: string]: any } = {
    planner: null,
    dni: null,
    surnames: null,
    name: null
  };

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              public shared: SharedService,
              private fb: FormBuilder,
              private router: Router,
              private translate: TranslateService,
              private message: NzMessageService) {

    this.studentForm = this.fb.group({
      studentRow: this.fb.array([])
    });

    this.studentControl = <FormArray>this.studentForm.controls.studentRow;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.ecoeId = +params.ecoeId;
      ECOE.fetch<ECOE>(this.ecoeId, {cache: false}).then(value => {
        this.ecoe = value;
        this.ecoe_name = this.ecoe.name;
      });

      this.loadStudents();
      this.InitStudentRow();
    });
  }

  updateCheckedSet(student: Student, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(student);
    } else {
      this.setOfCheckedId.delete(student);
    }
  }

   refreshCheckedStatus(): void {
    const listOfEnabledData = this.students;
    this.checked = listOfEnabledData.every(( student ) => this.setOfCheckedId.has(student));
    this.indeterminate = listOfEnabledData.some((student) => this.setOfCheckedId.has(student)) && !this.checked;
  }

  onItemChecked(student: Student, checked: boolean): void {
    this.updateCheckedSet(student, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.students
      .filter(({ disabled }) => !disabled)
      .forEach((student) => this.updateCheckedSet(student, checked));
    this.refreshCheckedStatus();
  }

  /**
   * Load students by the passed ECOE.
   * Then calls [updateEditCache]{@link #updateEditCache} function.
   */
  loadStudents() {
    this.loading = true;

    const sortDict = {};
    // tslint:disable-next-line:forin
    for (const key in this.mapOfSort) {
      const value = this.mapOfSort[key];
      if (value !== null) {
        sortDict[key] = value !== 'ascend';
        if (key === 'planner') {
          sortDict['planner'] = value !== 'ascend';
          sortDict['planner_order'] = value !== 'ascend';
        }
      }
    }

    Student.query<Student, Pagination<Student>>({
        where: {ecoe: this.ecoeId},
        sort: sortDict,
        perPage: this.perPage,
        page: this.page
      },
      {paginate: true}
    ).then(pagStudents => {
      this.editCache = {};
      this.students = pagStudents['items'];
      this.totalItems = pagStudents['total'];
      this.updateEditCache();
    }).finally(() => this.loading = false);
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayStudents]{@link #updateArrayStudents} function.
   *
   * @param student Resource selected
   */
  async deleteItem(student: Student) {
    const _answers = await student.getAllAnswers();
    
    const _promisesDel = []
    for (const _answer of _answers) {
      const _promise = _answer.destroy().catch(err => {
        console.error(err);
      });
      _promisesDel.push(_promise)
    }

    return new Promise<void>((resolve, reject) => {
      Promise.all(_promisesDel)
      .then(() => {
        student.destroy()
        .then(() => {
          this.updateArrayStudents(student.id as number)
          resolve()
        })
        .catch(err => reject(err));
      })
      .catch(err => reject(err))
    })
  }

  deleteSelected() {
    this.loading = true
    const delPromises = []
    for (const student of this.setOfCheckedId) {
      const _del = this.deleteItem(student).catch(err => console.error(err))
      delPromises.push(_del)
    }
    return Promise.all(delPromises).then(()=> {
      this.checked = false;
      this.indeterminate = false;
      this.loadStudents()
      this.message.create('success', this.translate.instant('ITEMS_DELETED',{"num": delPromises.length, "item_type": this.translate.instant('STUDENTS')}));
    })
    .finally(() => this.loading = false)
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
   * @param item determines if the resource is already saved
   */
  updateItem(item: any): void {
    if (!this.editCache[item.id].name || !this.editCache[item.id].surnames || !this.editCache[item.id].dni) {
      return;
    }

    const body = {
      dni: this.editCache[item.id].dni,
      surnames: this.editCache[item.id].surnames,
      name: this.editCache[item.id].name,
    };

    const request = item.update(body);

    request.then(response => {
      this.students = this.students.map(x => (x.id === item.id) ? response : x);
      this.editCache[response.id].edit = false;
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
  InitStudentRow() {
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
    this.InitStudentRow();
  }


  newStudent(dni: string,
             name: string,
             surnames: string,
             plannerOrder?: number,
             planner?: Planner): Promise<any> {

    const student = new Student();

    student.ecoe = this.ecoe;
    student.dni = dni.toString().trim();
    student.name = name.trim();
    student.surnames = surnames.trim();
    // student.plannerOrder = plannerOrder ? plannerOrder : null;
    student.planner = planner ? planner : null;

    return student.save().catch(err => {
      console.error(err);
    });

  }

  async saveStudents(items: any[]): Promise<any> {
    const savePromises = [];
    this.logPromisesERROR = [];
    this.logPromisesOK = [];

    const noItem = {
      statusText: 'no Item',
      message: this.translate.instant('INVALID_ITEM')
    };

    for (const item of items) {
      console.log(item);
      if (item.dni && item.name && item.surnames) {

        let studentPlanner: Planner = null;
        let studentPlannerOrder: number = null;


        // If we have round and shift, we search for a planner
        if (item.round && item.shift) {
          const studentShift: Shift = await Shift.first<Shift>({where: {ecoe: this.ecoeId, shift_code: item.shift}});
          const studentRound: Round = await Round.first<Round>({where: {ecoe: this.ecoeId, round_code: item.round}});

          if (studentRound != null && studentShift != null) {
            studentPlanner = await Planner.first<Planner>({where: {round: studentRound, shift: studentShift}});
            studentPlannerOrder = studentPlanner ? item.planner_order : null;
          }
        }

        savePromises.push(
          this.newStudent(item.dni, item.name, item.surnames, studentPlannerOrder, studentPlanner)
            .then(result => {
              this.logPromisesOK.push(result);
              return result;
            })
            .catch(err => {
              this.logPromisesERROR.push({
                value: JSON.stringify(item),
                reason: err
              });
              return err;
            })
        );
      } else {
        this.logPromisesERROR.push({
          value: JSON.stringify(item),
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
  importStudents(parserResult: any) {
    const students: any[] = parserResult as Array<any>;
    if (!students[students.length - 1]['name']) {
      students.pop();
    }

    this.saveStudents(parserResult as Array<any>)
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
    this.shared.doFormDirty(this.studentForm);
    if (this.studentForm.valid) {
      this.saveStudents(this.studentForm.get('studentRow').value)
        .finally(() => {
          this.loadStudents();
          this.closeDrawer();
          this.InitStudentRow();
          this.shared.cleanForm(this.studentForm);
        });
    }
  }

  sort(sortName: string, value: string): void {
    for (const key in this.mapOfSort) {
      this.mapOfSort[key] = key === sortName ? value : null;
    }

    this.loadStudents();
  }

  onBack() {
    this.router.navigate(['/ecoe/' + this.ecoeId + '/admin']).finally();
  }

  deleteRow(idx: number) {
    this.studentControl.removeAt(idx);
  }
  
}
