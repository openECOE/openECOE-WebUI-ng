import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {Answer, BlockType, Option, Planner, Round, Shift, Station, Student} from '../../../models';
import {QuestionsService} from '../../../services/questions/questions.service';
import {ApiService} from '../../../services/api/api.service';
import {getPotionID} from '@openecoe/potion-client';
import {AppComponent} from '../../../app.component';
import {AuthenticationService} from '../../../services/authentication/authentication.service';

@Component({
  selector: 'app-evaluate',
  templateUrl: './evaluate.component.html',
  styleUrls: ['./evaluate.component.less']
})
export class EvaluateComponent implements OnInit {

  private ecoeId: number;
  private stationId: number;
  private shiftId: number;
  private roundId: number;

  private station: Station;
  private shift: Shift;
  private round: Round;
  students: Student[] = [];
  questionsByQblock: BlockType[] = [];

  currentStudent: CurrentStudent = {
    index: 0,
    student: new Student(),
    answers: []
  };

  loading: boolean;
  getQuestionsCompleted: boolean;
  isSpinning: boolean = true;
  ecoeDay: string;


  constructor(private route: ActivatedRoute,
              private router: Router,
              private location: Location,
              private questionService: QuestionsService,
              private apiService: ApiService,
              private authService: AuthenticationService,
              @Inject(AppComponent) private parent: AppComponent) {
  }

  ngOnInit() {
    if (this.authService.userLogged) {
      this.getParams(this.route.snapshot.params);
      this.loading = true;
      this.getData().finally();
    } else {
      this.authService.logout();
    }
  }

  getParams(params: {}) {
    this.stationId = params['stationId'];
    this.shiftId = params['shiftId'];
    this.roundId = params['roundId'];
    this.ecoeId = params['ecoeId'];
    this.ecoeDay = params['date'];
  }

  getData() {
    Shift.fetch(this.shiftId, {skip: ['ecoe']}).then( (shift: Shift) => this.shift = shift);
    Round.fetch(this.roundId, {skip: ['ecoe']}).then( (round: Round) => this.round = round);
    Station.fetch(this.stationId, {skip: ['ecoe']}).then((station: Station) => {
      this.station = station;
      this.getParentStation();
      this.getQuestions();
    });
    return this.getPlanner().then( (students: Student[]) => {
      this.students = this.reorderStudents(students, this.station);
      if (this.station && !this.station.parentStation && this.students.length > 0) {
        this.setCurrentStudent(this.students.filter(student => student && student.plannerOrder === this.station.order)[0] );
      } else { this.setCurrentStudent({plannerOrder: 0} as Student); }
      return;
    });
  }

  getPlanner() {
    return Planner.query(
      {where: {
          round: +this.roundId,
          shift: +this.shiftId
        }
      }
    ).then( (result: Planner[]) => {
      return (result && result.length > 0)
        ? new Promise(resolve => resolve(

          Student.query({
            where: { planner: result[0].id },
            sort: {plannerOrder: false}
          })
        ))
        : new Promise(resolve => resolve([]));
    });
  }

  getAnswers(student: Student) {
    if (student.id) {
      student.getAllAnswers({cache: false, skip: ['question']}, {cache: false, skip: ['question']})
        .then((response: Answer[]) => this.currentStudent.answers = [...response])
        .finally(() => this.isSpinning = false);
    } else {
      this.currentStudent.answers = [];
    }
  }

  getQuestions() {
    this.questionService.getQuestionsByStation(this.station).subscribe(
      questions => {
        this.loading = false;
        if (questions.length > 0) {
          this.questionsByQblock = Object.create(questions);
        }
      },
      (err) => console.warn(err),
      () => this.getQuestionsCompleted = true);
  }

  onBack() {
    this.router.navigate(['/ecoe', this.ecoeId, 'eval', 'date', this.ecoeDay, 'round', this.roundId, 'station', this.stationId]);
  }

  setCurrentStudent(currentStudent: Student) {
    if (currentStudent) {
      this.isSpinning = true;
      this.currentStudent.student = Object.create(currentStudent);
      this.currentStudent.index = (this.students.indexOf(currentStudent) >= 0 ? this.students.indexOf(currentStudent) : 0 );
      this.getAnswers(this.currentStudent.student);
    }
  }

  reorderStudents(students: Student[], station: Station) {
    const arrStudents: Student[] = [];
    if (students.length < 1) { return  students; }

    // if there aren't parent station, first student (ordered by plannerOrder) will be this same than
    // station order. In other case first field will be empty.
    if (!station.parentStation) {
      arrStudents.push(students[station.order - 1]);
    } else {
      arrStudents.push(new Student());
    }

    let counter = 0;
    while (counter < students.length) {
      // if first element (previously) inserted in arrStudents is null --> idx will be -1
      // in other case will be >= 0
      const idx = students.indexOf(arrStudents[arrStudents.length - 1]);
      // if student index is greater than 0 --> first student is equivalent to station.order and
      // the next student will be the previous (ref. students array). If the first students is the
      // first element on students then the next student will be the last element from students.
      const auxStudent = idx > 0
        ? students[idx - 1]
        : (idx === 0)
          ? students[students.length - 1]
          : ((station.order - 1) - 1 >= 0)
            ? students[(station.order - 1) - 1]
            : students[students.length - 1];
      arrStudents.push(auxStudent);
      counter++;
    }

    if (arrStudents[0] && arrStudents[0].dni) {
      const lastIndex = arrStudents.lastIndexOf(students[station.order - 1]);
      delete arrStudents[lastIndex];
    } else {
      arrStudents.push(students[station.order - 1]);
    }

    let cleanArrStudents = [...arrStudents];

    cleanArrStudents = cleanArrStudents.slice(1, cleanArrStudents.length - 1).filter(Boolean);

    if (arrStudents[0] || cleanArrStudents.length > 0) {
      cleanArrStudents.unshift(arrStudents[0]);
    } else { // WHEN there are more stations than students.
      cleanArrStudents.unshift(...students);
      let n = cleanArrStudents.length;
      while (n < this.station.order) {
        cleanArrStudents.unshift(({plannerOrder: n + 1} as Student));
        n++;
      }
    }
    return cleanArrStudents;
  }

  nextStudent() {
    if (this.students.length < 1) { return; }
    if ( (this.currentStudent.index + 1) !== this.students.length ) {
      this.currentStudent.index ++;
      this.setCurrentStudent(this.students[this.currentStudent.index]);
    }
    this.scrollTabContentToTop();
  }

  previousStudent() {
    if (this.students.length < 1) { return; }
    if ( this.currentStudent.index !== 0 ) {
      this.currentStudent.index --;
      this.setCurrentStudent(this.students[this.currentStudent.index]);
    }
  }

  updateAnswer($event: any) {
    if ($event['checked']) {
      this.currentStudent.student.addAnswer(($event['option'] as Option))
        .then( () => {
          this.getAnswers(this.currentStudent.student);
        })
        .catch( err => console.warn(err));
    } else {
      const option = ($event['option'] as Option);
      this.removeAnswer(this.currentStudent.student.id, option);
    }
  }

  removeAnswer(studentId: number, option: Object) {
    if (!studentId || studentId < 0) { return; }
    let count = 0;
    this.apiService.removeAnswer(studentId, option)
      .toPromise()
      .catch( err => {
        console.error(err);
        count++;
        if (count <= 2) {this.removeAnswer(studentId, option); }
      });
  }

  getParentStation() {
    if (this.station.parentStation !== null && !this.station.parentStation.name) {
      Station.fetch<Station>(getPotionID(this.station.parentStation['$uri'], '/stations'))
        .then(parentStation => this.station.parentStation = parentStation);
    }
  }

  private scrollTabContentToTop(): void {
    // @ts-ignore
    this.parent.backTop.clickBackTop();
  }
}

interface CurrentStudent {
  index: number;
  student: Student;
  answers: any[];
}
