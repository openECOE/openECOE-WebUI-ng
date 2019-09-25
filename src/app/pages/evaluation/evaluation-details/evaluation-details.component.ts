import { Component, OnInit } from '@angular/core';
import {ECOE, Round, Shift, Station} from '../../../models';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

@Component({
  selector: 'app-evaluation-details',
  templateUrl: './evaluation-details.component.html',
  styleUrls: ['./evaluation-details.component.less']
})
export class EvaluationDetailsComponent implements OnInit {
  private rounds: Round[] = [];
  private stations: Station[] = [];

  nzTabPosition = 'left';
  selectedIndexRound = 0;
  selectedIndexShift = 0;
  private shifts: Shift[];
  private filteredShifts: Shift[];
  private ecoeId: number;
  private ecoe: ECOE;

  private shiftDays: string[] = [];

  constructor(private route: ActivatedRoute,
              private location: Location) { }

  async ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;
    this.ecoe = (await ECOE.fetch(this.ecoeId)) as ECOE;
    this.getData(this.ecoe);
  }

  onChangeShiftDay($event) {
    console.log($event);
    this.filteredShifts = this.shifts.filter( x => {
      if (this.getStringDate(x.timeStart) === $event) {
        return x;
      }
    });
  }

  getStringDate(date: Date) {
    return date.toLocaleString().split(' ', 1)[0];
  }

  getData(ecoe: ECOE) {
    ecoe.rounds()
      .then((rounds: Round[]) => {
        this.rounds = rounds;
        console.log('rounds:', this.rounds);
      });
    ecoe.shifts()
      .then((shifts: any[]) => {
        this.shifts = shifts;

        const dates: string[] = this.shifts.map(x => this.getStringDate(x.timeStart) ) ;
        this.shiftDays =  dates.filter((v, i, a) => a.indexOf(v) === i);

        this.filteredShifts = this.shifts.filter( x => {
          if ( this.getStringDate(x.timeStart) === this.shiftDays[this.selectedIndexShift]) {
            return x;
          }
        });
      });
    ecoe.schedules()
      .then((schedules: any[]) => {
        console.log('schedules:', schedules);
      });
    ecoe.students()
      .then((students: any[]) => {
        console.log('students:', students);
      });
    ecoe.configuration()
      .then((configuration: any[]) => {
        console.log('configuration:', configuration);
      });
    ecoe.stations()
      .then((stations) => {
        // @ts-ignore
        this.stations = stations as Station[];
        console.log('stations:', stations);
      });
  }

  onBack() {
    this.location.back();
  }


  /* tslint:disable-next-line:no-any */
  log(args: any[]): void {
    console.log(args);
  }

}
