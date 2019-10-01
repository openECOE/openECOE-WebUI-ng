import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {BlockType, Option, Planner, Round, Shift, Station, Student} from '../../../models';
import {QuestionsService} from '../../../services/questions/questions.service';
import {ApiService} from '../../../services/api/api.service';

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
  private students: Student[] = [];
  private questionsByQblock: BlockType[] = [];

  private currentStudent: CurrentStudent = {
    index: 0,
    student: new Student(),
    answers: []
  };

  loading: boolean;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private questionService: QuestionsService,
              private apiService: ApiService) { }

  ngOnInit() {
    this.getParams(this.route.snapshot.params);
    this.loading = true;
    this.getData().finally();
  }


  getParams(params: {}) {
    this.stationId = params['stationId'];
    this.shiftId = params['shiftId'];
    this.roundId = params['roundId'];
    this.ecoeId = params['ecoeId'];
  }

  async getData() {
    this.shift = await Shift.fetch(this.shiftId) as Shift;
    this.round = await Round.fetch(this.roundId) as Round;
    this.station = await Station.fetch(this.stationId) as Station;
    await this.getQuestions()
      .then(() => {
        this.loading = false;
        return;
      });
    this.getPlanner()
      .then( students => {
        // @ts-ignore
        this.students = students as Student[];
        this.setCurrentStudent(students[0]);
        this.currentStudent.index = 0;
      });
  }

  getPlanner() {
    return Planner.query(
      {where: {
          round: this.round,
          shift: this.shift
        }
      }
    ).then( (result: Planner[]) => {
      return result[0]
        .getStudents();
    });
  }

  getAnswers(student: Student) {
    student.getAnswers()
      .then((response: any[]) => {
        this.currentStudent.answers = [...response];
      });
  }

  getQuestions() {
    return this.questionService.getQuestionsByStation(this.station)
      .then(result => {
        return this.questionsByQblock = result;
      });
  }

  onBack() {
    this.location.back();
  }

  setCurrentStudent(currentStudent: Student) {
    if (currentStudent) {
      Object.assign(this.currentStudent.student, currentStudent);
      // this.currentStudent.answers = [...[]];
      this.getAnswers(currentStudent);
    }
  }

  nextStudent() {
    if (this.students.length < 1) { return; }
    this.currentStudent.index = ((this.currentStudent.index + 1) === this.students.length)
      ? 0
      : this.currentStudent.index + 1;
    this.setCurrentStudent(this.students[this.currentStudent.index]);
  }

  previousStudent() {
    if (this.students.length < 1) { return; }
    this.currentStudent.index = (this.currentStudent.index === 0)
      ? (this.students.length - 1)
      : this.currentStudent.index - 1;
    this.setCurrentStudent(this.students[this.currentStudent.index]);
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
  removeAnswer(studentId: number, option: Object) {
    this.apiService.removeAnswer(studentId, option)
      .then(() => 'OK');
  }
}

interface CurrentStudent {
  index: number;
  student: Student;
  answers: any[];
}
