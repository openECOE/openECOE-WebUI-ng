import {Component, OnInit} from '@angular/core';
import {ECOE, Round, Shift, Station} from '../../../models';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import * as moment from 'moment';
import {SharedService} from '../../../services/shared/shared.service';

@Component({
  selector: 'app-evaluation-details',
  templateUrl: './evaluation-details.component.html',
  styleUrls: ['./evaluation-details.component.less']
})
export class EvaluationDetailsComponent implements OnInit {
  private rounds: Round[] = [];
  private stations: Station[] = [];

  selectedIndexRound = 0;
  selectedIndexShift = 0;
  private shifts: Shift[];
  private filteredShifts: Shift[];
  private ecoeId: number;
  private ecoe: ECOE;

  private shiftDays: string[] = [];
  momentRef = moment;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private shared: SharedService) { }

  async ngOnInit() {
    this.momentRef.locale(this.shared.getUsersLocale('en-US'));
    this.ecoeId = +this.route.snapshot.params.id;
    this.ecoe = (await ECOE.fetch(this.ecoeId)) as ECOE;
    this.getData(this.ecoe);
  }

  onChangeShiftDay($event) {
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
    this.getStations();
  }

  getStations() {
    Station.query({
      where: {ecoe: this.ecoeId},
      sort: {order: false}
    }).then( (stations: Station[]) =>
      this.stations = stations);
  }

  onBack() {
    this.location.back();
  }

}
