import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {Answer, BlockType, Planner, Round, Shift, Station, Student} from '../../../models';
import {QuestionsService} from '@services/questions/questions.service';
import {ApiService} from '@services/api/api.service';
import {getPotionID} from '@openecoe/potion-client';
import {AppComponent} from '@app/app.component';
import {AuthenticationService} from '@services/authentication/authentication.service';
import { ServerStatusService } from '@app/services/server-status/server-status.service';
import { take } from 'rxjs/operators';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {QuestionComponent} from '@app/modules/evaluation/question/question.component';
import { QuestionOfflineService } from '@app/services/questions/question-offline.service';
@Component({
  selector: 'app-evaluate',
  templateUrl: './evaluate.component.html',
  styleUrls: ['./evaluate.component.less']
})
export class EvaluateComponent implements OnInit {

  ecoeId: number;
  stationId: number;
  shiftId: number;
  roundId: number;

  station: Station;
  shift: Shift;
  round: Round;
  students: Student[] = [];
  questionsByQblock: BlockType[] = [];

  currentStudent: CurrentStudent = {
    index: 0,
    student: new Student(),
    answers: null
  };

  loading: boolean;
  getQuestionsCompleted: boolean;
  isSpinning: boolean = true;
  ecoeDay: string;
  isOnline: boolean;
  primerinicio: number = 0;
  constructor(private route: ActivatedRoute,
              private router: Router,
              public location: Location,
              private questionService: QuestionsService,
              public apiService: ApiService,
              private authService: AuthenticationService,
              private ServerStatusService: ServerStatusService,
              protected questionOffline: QuestionOfflineService,
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
     this.ServerStatusService.isAvailable.subscribe(value => {
      this.isOnline = value;
      });
    

  }

  getParams(params: {}) {
    this.stationId = params['stationId'];
    this.shiftId = params['shiftId'];
    this.roundId = params['roundId'];
    this.ecoeId = params['ecoeId'];
    this.ecoeDay = params['date'];
  }

  async getData() {
  await  Shift.fetch(this.shiftId, {skip: ['ecoe']}).then((shift: Shift) => this.shift = shift);
  await  Round.fetch(this.roundId, {skip: ['ecoe']}).then((round: Round) => this.round = round);
  await  Station.fetch(this.stationId, {skip: ['ecoe']}).then((station: Station) => {
      this.station = station;
      this.getParentStation();
      this.getQuestions();
    });
      const students = await this.getPlanner() as Student[];
      this.students = this.reorderStudents(students, this.station);

      if (this.station && !this.station.parentStation && this.students.length > 0) {
        this.setCurrentStudent(this.students.filter(student => student && student.plannerOrder === this.station.order)[0]);
      } else {
        this.setCurrentStudent({planner_order: 0} as Student);
      }
      this.loading = false;
      return;
  }

  getPlanner() {
    return Planner.query(
      {
        where: {
          round: +this.roundId,
          shift: +this.shiftId
        }
      }
    ).then((result: Planner[]) => {
      return (result && result.length > 0)
        ? new Promise(resolve => resolve(
          Student.query({
            where: {planner: result[0].id},
            sort: {plannerOrder: false}
          })
        ))
        : new Promise(resolve => resolve([]));
    });
  }
  
  
  async getAnswers(student: Student, station: Station): Promise<Array<Answer>> {
    console.log("entra a getAnswers");
      if (student.id && station.id) 
      {
        console.log("entra a getAnswers con student y station");
        const key = `answers_${student.id}_${station.id}`;
        console.log('serverStatus', this.isOnline);
        if(this.isOnline) 
        {
            const answers = await this.queryAnswers(student, station);
            console.log('before save (with toJSON):', answers);   
            localStorage.setItem(key, JSON.stringify(answers.map(this.answerToString)));
            console.log('recuperando repsuestas desde el servidor', answers);
            return answers;
        }  
        if(!this.isOnline)
        {
          console.log("detecta que no hay conexion")
          const cachedAnswers = localStorage.getItem(key);
          const rawAnswers = JSON.parse(cachedAnswers || '[]');
          console.log('raw answer before revive:', rawAnswers);
          return rawAnswers;
        }
      } 
      else 
      {
        
        return [];
      }
      this.primerinicio +1;
  }

  answerToString(answer: Answer)
  {
    const _answer = {
      id: answer.id,
      schema: answer.schema,
      points: answer.points,
      question: {...answer.question},
      student: {...answer.student},
      station: {...answer.station}
    };

    _answer.question.id = answer.question.id;
    _answer.student.id = answer.student.id;
    _answer.station.id = answer.station.id;

    return _answer;
    

  }

   queryAnswers(student: Student, station: Station, page: number = 1): Promise<Answer[]> {
    return new Promise<Array<Answer>>(resolve => {
      Answer.query({
        where: {student: student, station: station},
        perPage: 100,
        page: page
      }, {
        paginate: true
      })
        .then(async (answers) => {
          let _answerList = [...answers['items']];


          if (answers['pages'] > page) {
            _answerList = _answerList.concat(await this.queryAnswers(student, station, page + 1));
          }
          resolve(_answerList);
        });
    });
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

  async setCurrentStudent(currentStudent: Student) {
    if (currentStudent) {
      this.isSpinning = true;
      this.currentStudent.student = Object.create(currentStudent);
      this.currentStudent.index = (this.students.indexOf(currentStudent) >= 0 ? this.students.indexOf(currentStudent) : 0);
      const _answerList = await this.getAnswers(this.currentStudent.student, this.station)
      this.currentStudent.answers = _answerList;
      this.isSpinning = false;
    }
  }

  reorderStudents(students: Student[], station: Station) {
    const arrStudents: Student[] = [];
    if (students.length < 1) {
      return students;
    }

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
        cleanArrStudents.unshift(({planner_order: n + 1} as Student));
        n++;
      }
    }
    return cleanArrStudents;
  }

   async nextStudent() {
    if (this.students.length < 1) {
      return;
    }
    if ((this.currentStudent.index + 1) !== this.students.length) {
      this.currentStudent.index++;
      this.setCurrentStudent(this.students[this.currentStudent.index]);
      this.scrollTabContentToTop();
    }
  }

  previousStudent() {
    if (this.students.length < 1) {
      return;
    }
    if (this.currentStudent.index !== 0) {
      this.currentStudent.index--;
      this.setCurrentStudent(this.students[this.currentStudent.index]);
    }
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
  answers: Array<Answer>;
}
