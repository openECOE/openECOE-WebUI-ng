import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {BlockType, Option, Planner, Round, Shift, Station, Student} from '../../../models';
import {QuestionsService} from '../../../services/questions/questions.service';
import {ApiService} from '../../../services/api/api.service';
import {SocketService} from '../../../services/socket/socket.service';
import {getPotionID} from '@openecoe/potion-client';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-evaluate',
  templateUrl: './evaluate.component.html',
  styleUrls: ['./evaluate.component.less']
})
export class EvaluateComponent implements OnInit, AfterViewInit, OnDestroy {

  private ecoeId: number;
  private stationId: number;
  private shiftId: number;
  private roundId: number;

  private station: Station;
  private shift: Shift;
  private round: Round;
  private students: Student[] = [];
  private questionsByQblock: BlockType[] = [];
  private questionsByQblockSubscription: Subscription;

  private currentStudent: CurrentStudent = {
    index: 0,
    student: new Student(),
    answers: []
  };

  private currentSeconds: number = 0;
  private totalDuration: number = 0;
  private stageName: string;
  private aborted: boolean;

  private event: {};

  loading: boolean;

  // public tabsContentRef!: ElementRef;
  @ViewChild('tabsContentRef') tabsContentRef: ElementRef;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private questionService: QuestionsService,
              private apiService: ApiService,
              private socket: SocketService,
              private renderer: Renderer2) {
  }

  ngOnInit() {
    this.loading = true;

    this.getParams(this.route.snapshot.params);

    this.getData().finally();

    /*setInterval(() => {
      console.log('scroll from evaluate');
      window.scrollTo( {
        top: 0
      });
    }, 4000);*/
  }

  ngAfterViewInit(): void {
    this.socket.onConnected(this.roundId).subscribe( () => {
      this.socket.onReceive('init_stage').subscribe(data => {
        console.log(data);
      });
      this.socket.onReceive('end_round').subscribe(data => {
        console.log(data);
      });
      this.socket.onReceive('evento').subscribe(data =>
        this.event = data[1]
      );
      this.socket.onReceive('aborted').subscribe(data => {
        this.aborted = true;
        this.stageName = (data[0] as string).toUpperCase();
      });
      this.socket.onReceive('tic_tac').subscribe(data => {
        this.aborted        = false;
        this.stageName      = data[1]['stage']['name'];
        this.currentSeconds = parseInt(data[1]['t'], 10);
        this.totalDuration  = parseInt(data[1]['stage']['duration'], 10);
      });
    });
  }

  ngOnDestroy(): void {
    this.questionsByQblockSubscription.unsubscribe();
  }

  getParams(params: {}) {
    this.stationId = params['stationId'];
    this.shiftId = params['shiftId'];
    this.roundId = params['roundId'];
    this.ecoeId = params['ecoeId'];
  }

  getData() {
    Shift.fetch(this.shiftId).then( (shift: Shift) => this.shift = shift);
    Round.fetch(this.roundId).then( (round: Round) => this.round = round);
    Station.fetch(this.stationId).then((station: Station) => {
      this.station = station;
      this.getParentStation();
      this.getQuestions();
    });
    return this.getPlanner().then( (students: Student[]) => {
      this.students = this.reorderStudents(students, this.station);
      if (!this.station.parentStation) {
        this.setCurrentStudent(this.students.filter(student => student.plannerOrder === this.station.order)[0] );
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
      student.getAnswers()
        .then((response: any[]) => {
          this.currentStudent.answers = [...response];
        });
    } else { this.currentStudent.answers = []; }
  }

  getQuestions() {
    this.questionsByQblockSubscription = this.questionService.getQuestionsByStation(this.station)
      .subscribe(questions => {
        if (questions.length > 0) {
          this.questionsByQblock = Object.create(questions);
          this.loading = false;
        }
      }, error => console.log(error));
  }

  onBack() {
    this.location.back();
  }

  setCurrentStudent(currentStudent: Student) {
    if (currentStudent) {
      this.currentStudent.student = Object.create(currentStudent);
      this.currentStudent.index = (this.students.indexOf(currentStudent) >= 0 ? this.students.indexOf(currentStudent) : 0 );
      this.getAnswers(currentStudent);
    }
  }

  reorderStudents(students: Student[], station: Station) {
    const arrStudents: Student[] = [];
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

    if (arrStudents[0].dni) {
      const lastIndex = arrStudents.lastIndexOf(students[station.order - 1]);
      delete arrStudents[lastIndex];
    } else {
      arrStudents.push(students[station.order - 1]);
    }

    let cleanArrStudents = [...arrStudents];

    cleanArrStudents = cleanArrStudents.slice(1, cleanArrStudents.length - 1).filter(Boolean);

    cleanArrStudents.unshift(arrStudents[0]);

    return cleanArrStudents;
  }


  nextStudent() {
    if (this.students.length < 1) { return; }
    if ( (this.currentStudent.index + 1) !== this.students.length ) {
      this.currentStudent.index ++;
      this.setCurrentStudent(this.students[this.currentStudent.index]);
    }
    console.log('before scroll');

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
          this.currentStudent.student.getAnswers()
            .catch( err => console.warn(err));
        })
        .catch( err => console.warn(err));
    } else {
      const option = ($event['option'] as Option);
      this.removeAnswer(this.currentStudent.student.id, option);
    }
  }

  removeAnswer(studentId: number, option: Object) { console.log(studentId);
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

  // I scroll the tab-content overflow-container back to the top.
  private scrollTabContentToTop(): void {
    console.log(this.tabsContentRef.nativeElement.scroll( 0, 0 ));
    // this.tabsContentRef['nzTitle']['elementRef'].nativeElement.scroll( 0, 0 );
    window.scrollTo(0, 0);
    this.tabsContentRef.nativeElement.scroll( 0, 0 );

  }
}

interface CurrentStudent {
  index: number;
  student: Student;
  answers: any[];
}
