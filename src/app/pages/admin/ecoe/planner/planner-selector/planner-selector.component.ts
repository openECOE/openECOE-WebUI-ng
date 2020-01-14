import {Component, EventEmitter, Input, OnInit, OnChanges, Output, TemplateRef} from '@angular/core';
import {Planner, Round, Shift} from '../../../../../models';
import {Student} from '../../../../../models';
import {Item, Pagination} from '@openecoe/potion-client';
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
        console.log('Planner deleted', planner);
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

  transferDisabled: boolean = false;

  loading: boolean = false;

  selectedStudents: Student[] = [];

  searchString: string = null;

  constructor(public shared: SharedService) {
  }

  ngOnInit() {

    this.groupName = this.shift.shiftCode + this.round.roundCode;
    this.searchStudents();
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
    this.planner.students = this.planner.students.filter(value => value.id !== student.id);
    student.save();
  }

  // tslint:disable-next-line:no-any
  filterOption(inputValue: string, item: any): boolean {
    return item.student.name.indexOf(inputValue) > -1 ? true :
      item.student.surnames.indexOf(inputValue) > -1 ? true :
        item.student.dni.indexOf(inputValue) > -1;
  }

  searchStudents(value?: string) {
    this.loading = true;
    const excludeItems = [];

    // TODO: Search by names and DNI

    let query: {} = {ecoe: this.ecoeId, planner: null};

    query = value ? {...query, ...{surnames: {'$contains': value}}} : query;

    console.log('Search query', query.toString());

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

}
