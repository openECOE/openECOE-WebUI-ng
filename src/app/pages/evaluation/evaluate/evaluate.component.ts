import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {ECOE, Round, Shift, Station, Student} from '../../../models';
import {QuestionsService} from '../../../services/questions/questions.service';

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

  private ecoe: ECOE;
  private station: Station;
  private shift: Shift;
  private round: Round;

  private currentStudent = Student;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private questionService: QuestionsService) { }

  ngOnInit() {
    console.log('EvaluateComponent', this.route.snapshot.params);
    this.getParams(this.route.snapshot.params);

    this.getData()
      .then(() => {
        console.log('Data obtained', this.station, this.shift, this.round);

        this.questionService.getQuestionsByStation(this.station)
          .then(result => {
            console.log('result', result);
          });

        this.ecoe.schedules()
          .then((schedules: any[]) => {
            console.log('schedules:', schedules);
          });
        this.ecoe.students()
          .then((students: any[]) => {
            console.log('students:', students);
            this.currentStudent = students[0];
          });
        this.ecoe.configuration()
          .then((configuration: any[]) => {
            console.log('configuration:', configuration);
          });
      });
  }

  getParams(params: {}) {
    this.stationId = params['stationId'];
    this.shiftId = params['shiftId'];
    this.roundId = params['roundId'];
    this.ecoeId = params['ecoeId'];
  }

  async getData() {
    this.station = await Station.fetch(this.stationId) as Station;
    this.shift = await Shift.fetch(this.shiftId) as Shift;
    this.round = await Round.fetch(this.roundId) as Round;
    this.ecoe = await ECOE.fetch(this.ecoeId) as ECOE;
    return new Promise(resolve => resolve());
  }

  onBack() {
    this.location.back();
  }

}
