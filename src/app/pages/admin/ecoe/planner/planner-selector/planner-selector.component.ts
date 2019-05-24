import {Component, EventEmitter, Input, OnInit, OnChanges, Output, TemplateRef} from '@angular/core';
import {Planner, Round, Shift} from '../../../../../models/planner';
import {ECOE, Station, Student} from '../../../../../models/ecoe';
import {Item, Pagination} from '@openecoe/potion-client';
import {forkJoin, from} from 'rxjs';
import {map} from 'rxjs/operators';
import {NzModalRef, NzModalService} from 'ng-zorro-antd';
import {TranslateService} from '@ngx-translate/core';
import {SharedService} from '../../../../../services/shared/shared.service';
import {formatDate} from '@angular/common';


/**
 * Component to select and display information about a Planner
 */
@Component({
  selector: 'app-planner-selector',
  templateUrl: './planner-selector.component.html',
  styleUrls: ['./planner-selector.component.less']
})
export class PlannerSelectorComponent implements OnInit, OnChanges {

  @Input() ecoeId: number;
  @Input() stationsNum: number;

  @Output() roundChange = new EventEmitter();

  @Input()
  get round() {
    return this.plannerRound;
  }

  set round(round: Round) {
    this.plannerRound = round;
    this.roundChange.emit(this.plannerRound);
  }

  @Output() shiftChange = new EventEmitter();

  @Input()
  get shift() {
    return this.plannerShift;
  }

  set shift(shift: Shift) {
    this.plannerShift = shift;
    this.shiftChange.emit(this.plannerShift);
  }

  planner: Planner;

  plannerRound: Round;
  plannerShift: Shift;

  modalStudentSelector: NzModalRef;
  modalStudentSelectorWidth: number = 768;

  listStudents: any[];
  private plannerSelected: { round: Round; shift: Shift; planner: Planner };
  private isEditing: { itemRef: Planner; edit: boolean };

  showStudentsSelector: boolean = false;

  loading: boolean = false;

  constructor(private modalService: NzModalService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.loadPlanner();
  }

  ngOnChanges() {
    this.loadPlanner();
  }

  loadPlanner() {
    this.loading = true;

    const excludeItems = ['students', 'answers', 'ecoe', 'planner'];

    // TODO: Review planner query
    Planner.query<Planner>({where: {'round': this.round.id, 'shift': this.shift.id}}, {skip: excludeItems})
      .then(response => this.planner = response[0])
      .catch(reason => console.log('ERROR', reason))
      .finally(() => this.loading = false);
  }

  /**
   * Save the planner passed and fill student planner_order.
   *
   * @param planner Reference of the Planner
   */
  savePlanner(planner: Planner): Promise<any> {
    return new Promise((resolve, reject) => {
      planner.save()
        .then(savedPlanner => {
          console.log('Planner created', savedPlanner);
          this.planner = savedPlanner;
          resolve(savedPlanner);
          // planner.students.forEach((student, index) => {
          //   student.plannerOrder = index + 1;
          //   student.save()
          //     .then(value => console.log('Student assigned to planner', value, savedPlanner)
          //     );
          // });
        })
        .catch(reason => {
          console.error('Planner create error', reason);
          reject(reason);
        });
    });


  }

  /**
   * Create the planner for round and shift.
   * Optionally you can pass a listStudents Array to load
   *
   * @param round Reference of the round
   * @param shift Reference of the shift
   * @param students Array of listStudents to link with the planner
   */
  createPlanner(round: any, shift: any, students?: Student[]): Promise<any> {
    return this.updatePlanner(new Planner(), round, shift, students);
  }

  /**
   * Update the planner passed.
   *
   * @param planner Reference of the selected planner
   * @param round Reference of the round
   * @param shift Reference of the shift
   * @param students Array of listStudents to link with the planner
   */
  updatePlanner(planner: any, round: any, shift: any, students?: Student[]): Promise<any> {
    planner.round = round.$id;
    planner.shift = shift.$id;
    planner.students = students;

    return this.savePlanner(planner);
  }

  /**
   * Delete the planner passed.
   * Then reloads all plannersMatrix and hides the modal.
   *
   * @param planner Reference of the selected planner
   */
  deletePlanner(planner: Planner | Item): Promise<any> {
    return planner.destroy()
      .then(value => {
        console.log('Planner deleted', planner);
        this.planner = null;
        this.destroyModal();
      });
  }

  /**
   * Load listStudents by the passed ECOE.
   * Maps the response and sets selected key to true if it has planner assigned and the reference is the same as the passed.
   * Then calls [checkStudentsSelected]{@link #checkStudentsSelected} function.
   *
   * @param shift Id of the selected shift
   * @param round Id of the selected round
   * @param planner? Reference of the selected planner
   */
  loadStudents(shift: Shift, round: Round, planner?: Planner) {
    this.listStudents = [];
    let studentsSelected = 0;

    from(Student.query({where: {'ecoe': this.ecoeId}}))
      .pipe(
        map(students => {
          return students.map(student => {
            const isSelected = (
              planner ?
                (student.planner && student.planner === planner) :
                (!student.planner && studentsSelected < this.stationsNum)
            );

            if (!planner && isSelected) {
              studentsSelected++;
            }

            return {
              data: student,
              selected: isSelected
            };
          });
        })
      ).subscribe(students => {
      this.listStudents = students;
      this.plannerSelected = {shift: shift, round: round, planner: planner};
      this.showStudentsSelector = true;

      this.isEditing = {
        itemRef: planner ? planner : null,
        edit: (typeof planner !== 'undefined')
      };

      this.checkStudentsSelected(this.listStudents.filter(student => student.selected));
    });
  }

  /**
   * Modifies the listStudents array and sets the disabled property to true if the selection length is equal or higher
   * than the number of stations and the student is not selected,
   * or if the student has a planner assigned and this planner is not the same as the selected.
   * @param selection Array of listStudents currently selected
   */
  checkStudentsSelected(selection: any[]) {
    this.listStudents = this.listStudents.map(student => {
      return {
        ...student,
        disabled: (selection.length >= this.stationsNum && !student.selected) ||
          (student.planner && student.planner !== this.plannerSelected.planner)
      };
    });
  }

  /**
   * Creates or updates the planner selected.
   * Then reloads all plannersMatrix and hides the modal.
   */
  assignPlanner() {
    const students = this.listStudents
      .filter(student => student.selected)
      .map(student => student.data);

    if (students.length === 0) {
      return;
    }

    const request = (
      this.plannerSelected.planner ?
        this.updatePlanner(
          this.plannerSelected.planner,
          this.plannerSelected.round,
          this.plannerSelected.shift,
          students)
        :
        this.createPlanner(this.plannerSelected.round, this.plannerSelected.shift, students)
    );

    request.then(() => {
      this.showStudentsSelector = false;
    });

  }

  createComponentModal(tplFooter: TemplateRef<{}>): void {
    const promise = new Promise<Planner>((resolve, reject) => {
      !this.planner ?
        this.createPlanner(this.round, this.shift)
          .then(value => resolve(value))
          .catch(reason => reject(reason))
        :
        resolve(this.planner);
    });

    promise.then(planner => {
      this.modalStudentSelector = this.modalService.create({
        nzTitle: this.translate.instant('SELECT_STUDENTS') +
          ' (' + formatDate(this.shift.timeStart, 'dd/MM/yyyy HH:mm', 'es') +
          ' ' + this.round.description + ')',
        nzContent: AppStudentSelectorComponent,
        nzWidth: this.modalStudentSelectorWidth,
        nzComponentParams: {
          ecoeId: this.ecoeId,
          planner: planner,
          maxStudents: this.stationsNum,
          round: this.plannerRound,
          shift: this.plannerShift,
          modalWidth: this.modalStudentSelectorWidth
        },
        nzFooter: tplFooter
      });
    });
  }

  destroyModal(): void {
    this.modalStudentSelector.destroy();
  }
}


@Component({
  selector: 'app-app-student-selector',
  templateUrl: './student-selector.component.html'
})
export class AppStudentSelectorComponent implements OnInit {

  @Input() ecoeId: number;
  @Input() planner: Planner;
  @Input() maxStudents: number;

  @Output() roundChange = new EventEmitter();

  @Input()
  get round() {
    return this.plannerRound;
  }

  set round(round: Round) {
    this.plannerRound = round;
    this.roundChange.emit(this.plannerRound);
  }

  @Output() shiftChange = new EventEmitter();

  @Input()
  get shift() {
    return this.plannerShift;
  }

  set shift(shift: Shift) {
    this.plannerShift = shift;
    this.shiftChange.emit(this.plannerShift);
  }

  @Input() modalWidth?: number = 300;

  plannerRound: Round;
  plannerShift: Shift;

  searchListStudents: Student[] = [];
  groupName: string;

  studentsSearch: Pagination<Student>;

  transferDisabled: boolean = false;

  loading: boolean = false;

  selectedStudents: Student[] = [];

  constructor(private modal: NzModalRef,
              public shared: SharedService) {
  }

  ngOnInit() {
    this.loading = true;

    this.groupName = this.shift.shiftCode + this.round.roundCode;

    const excludeItems = ['ecoe', 'answers', 'students'];

    Student.query<Student>({
      where: {
        ecoe: this.ecoeId,
        planner: this.planner.id
      },
      sort: {planner_order: false, surnames: false, name: false},
      perPage: this.maxStudents
    }, {skip: excludeItems})
      .then(students => {
        this.planner.students = students;
        this.searchStudents();
        this.loading = false;
      });
  }

  orderStudents(listStudents: Array<any>): Array<any> {
    return listStudents
      .sort((a, b) => a.student.planner_order > b.student.planner_order ? 1 : -1)
      .sort((a, b) => a.student.surnames > b.student.surnames ? 1 : -1)
      .sort((a, b) => a.student.name > b.student.name ? 1 : -1);
  }

  saveGroup() {
    const order = this.planner.students.length + 1;

    this.selectedStudents.forEach((student, index) => {

      this.addStudent(student, order + index);
    });


    this.selectedStudents = [];

  }

  addStudent(student: Student, order?: number) {
    order = order ? order : this.planner.students.length + 1;

    student.planner_order = order;
    student.planner = this.planner;
    student.save().then(savedStudent => {
      this.planner.students.push(savedStudent);
      this.searchListStudents = this.searchListStudents.filter(value => value.id !== student.id);
    });
  }

  rmStudent(student: Student) {
    student.planner_order = null;
    student.planner = null;
    student.save()
      .then(savedStudent => {
        this.planner.students = this.planner.students
          .filter(value => value.id !== savedStudent.id);
        this.searchStudents();
      });
  }

  // tslint:disable-next-line:no-any
  filterOption(inputValue: string, item: any): boolean {
    return item.student.name.indexOf(inputValue) > -1 ? true :
      item.student.surnames.indexOf(inputValue) > -1 ? true :
        item.student.dni.indexOf(inputValue) > -1;
  }

  searchStudents(value?: string) {
    this.loading = true;
    const excludeItems = ['ecoe', 'planner', 'answers'];

    // TODO: Search by names and DNI

    let query: {} = {ecoe: this.ecoeId, planner: null};

    query = value ? {...query, ...{surnames: {'$contains': value}}} : query;

    Student.query <Student, Pagination<Student>>({
      where: query,
      sort: {planner_order: false, surnames: false, name: false}
    }, {skip: excludeItems, paginate: true})
      .then(page => {
        this.studentsSearch = page;
        this.searchListStudents = page['items'];
        this.loading = false;
      });
  }

  loadMore() {
    this.studentsSearch.changePageTo(this.studentsSearch.page + 1)
      .then(page => {
        this.searchListStudents = [...this.searchListStudents, ...page['items']];
      });
  }

  search(ret: {}): void {
    console.log('nzSearchChange', ret);
    this.searchStudents(ret['value']);
  }

  selected(value: any) {
    console.log(value);
  }

  select(ret: { title: string, checked: boolean, direction: string, disabled: boolean, list: Array<any> }): void {
    console.log('nzSelectChange', ret);
    if (ret.direction === 'left') {
      const maxSelect = this.maxStudents - this.planner.students.length;

      const transferDisabled = ret.list.length >= maxSelect;
      if (transferDisabled) {
        //  Limit the list to only the max select Students you can add to Planner
        ret.list = ret.list.filter((value, index) => index < maxSelect);
      }

      this.disableStudents(this.getLeftStudentsNoPlanner(ret.list), transferDisabled);
    }
  }

  // change(ret: { from: string, to: string, list: Array<any> }): void {
  //   console.log('nzChange', ret);
  //   ret.list.forEach(value => {
  //     ret.to === 'right' ?
  //       this.addPlannerStudent(value.student) :
  //       this.removePlannerStudent(value.student);
  //   });
  //
  //   this.orderStudents(this.searchListStudents);
  // }

  getLeftStudentsNoPlanner(excludeList?: Array<any>): Array<any> {
    let leftStudents = this.searchListStudents.filter(value => value.direction === 'left' && !value.student.planner);

    if (excludeList) {
      leftStudents = leftStudents.filter(value => !excludeList.map(x => x.student).includes(value.student));
    }

    return leftStudents;
  }

  disableStudents(studentsList: Array<any>, disabled: boolean) {
    studentsList.forEach(value => {
      value.disabled = disabled;
      value.checked = false;
    });
  }

  // addPlannerStudent(itemStudent: Student) {
  //   itemStudent.planner = this.planner;
  //   itemStudent.plannerOrder = this.planner.students.length + 1;
  //   this.planner.students.push(itemStudent);
  //   itemStudent.save()
  //     .then(value => console.log('Student planner change', value))
  //     .catch(reason => console.error('ERROR Student planner change', reason));
  //   this.planner.save();
  // }
  //
  // removePlannerStudent(itemStudent: Student) {
  //   this.disableStudents(this.getLeftStudentsNoPlanner(), false);
  //   itemStudent.planner = null;
  //   itemStudent.plannerOrder = null;
  //   itemStudent.save()
  //     .then(saveStudent => {
  //       this.planner.students = this.planner.students.filter(value => value !== saveStudent);
  //       // this.ngOnInit();
  //       this.planner.save();
  //     });
  // }


}
