import {Component, EventEmitter, Input, OnInit, OnChanges, Output, TemplateRef} from '@angular/core';
import {Planner, Round, Shift} from '../../../models';
import {Student} from '../../../models';
import {Item, Pagination} from '@openecoe/potion-client';
import {NzModalRef, NzModalService} from 'ng-zorro-antd';
import {TranslateService} from '@ngx-translate/core';
import {SharedService} from '../../../services/shared/shared.service';
import {formatDate} from '@angular/common';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

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
    // TODO: Review planner query
    Planner.first<Planner>({where: {'round': this.plannerRound, 'shift': this.plannerShift}})
      .then(async response => {
        if (response != null) {
          this.planner = response;
          const pagStudents: Pagination<Student> = await this.planner.getStudents({}, {paginate: true});

          this.planner.students = [...pagStudents['items']];

          for (let i = 2; i <= pagStudents['pages']; i++) {
            this.planner.students = [...this.planner.students, (await pagStudents.changePageTo(i)).items];
          }
        }
      })
      .finally(() => this.loading = false)
      .catch(reason => console.log('ERROR', reason));
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
          savedPlanner.students = (savedPlanner.students || []);
          this.planner = savedPlanner;
          resolve(savedPlanner);
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
      .then(() => {
        this.planner = null;
        this.destroyModal();
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

  loading: boolean = false;

  selectedStudents: Student[] = [];

  constructor(public shared: SharedService) {
  }

  ngOnInit() {

    this.groupName = this.shift.shiftCode + this.round.roundCode;
    this.planner.students = this.plannerStudentsOrdered
    this.searchStudents();
  }

  saveGroup() {
    if (!this.planner.students) {
      this.planner.students = [];
    }

    const order = this.planner.students.length + 1;

    this.selectedStudents.forEach((student, index) => {

      this.addStudent(student, order + index);
    });

    this.selectedStudents = [];
  }

  addStudent(student: Student, order?: number) {
    order = order ? order : this.planner.students.length + 1;

    this.updateStudentPlanner(student, this.planner, order).then((updatedStudent) => {
      this.planner.students.push(updatedStudent);
      this.planner.students = this.plannerStudentsOrdered
      this.searchListStudents = this.searchListStudents.filter(value => value.id !== student.id);
    })
  }

  rmStudent(student: Student) {
    this.updateStudentPlanner(student, null, null).then((updatedStudent)=> {
      this.planner.students = this.planner.students.filter(value => value.id !== student.id);
      this.searchListStudents.push(updatedStudent);
      this.reorderPlannerStudents(this.planner.students)
    })
  }

  updateStudentPlanner(student: Student, planner: Planner, order: number) {
    const data = {"planner": planner, "planner_order": order}
    return student.update(data)
  }

  searchStudents(value?: string) {
    this.loading = true;
    const excludeItems = [];
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
      })
      .catch((err) => console.warn('exception catch', err));
  }

  loadMore() {
    if (this.studentsSearch.page >= this.studentsSearch.page) {
      return;
    }

    this.studentsSearch.changePageTo(this.studentsSearch.page + 1)
      .then(page => {
        this.searchListStudents = [...this.searchListStudents, ...page['items']];
      })
      .catch(() => console.warn('no more results'));
  }

  

  moveStudent(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.planner.students, event.previousIndex, event.currentIndex);
    this.reorderPlannerStudents(this.planner.students)

  }

  get plannerStudentsOrdered() {
    return this.planner.students.sort((a, b) => a.plannerOrder > b.plannerOrder?1:-1)
  }

  reorderPlannerStudents(students: Array<Student>) {
    students.forEach((student, index) => {
      const _order = index + 1
      this.updateStudentPlanner(student, this.planner, _order)
    })
  }
}
