import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ECOE, Round, Shift, Station} from '../../../models';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import * as moment from 'moment';
import {SharedService} from '../../../services/shared/shared.service';
import {AuthenticationService} from '../../../services/authentication/authentication.service';

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
  private filteredShifts: Shift[] = [];
  private ecoeId: number;
  private ecoe: ECOE;

  private shiftDays: string[] = [];
  momentRef = moment;
  refresh: boolean = false;
  isSpinning: boolean = false;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private shared: SharedService,
              private cdRef: ChangeDetectorRef,
              private authService: AuthenticationService) { }

  async ngOnInit() {
    if (this.authService.userLogged) {
      this.momentRef.locale(this.shared.getUsersLocale('en-US'));
      this.ecoeId = +this.route.snapshot.params.id;
      this.ecoe = (await ECOE.fetch(this.ecoeId)) as ECOE;
      this.getData(this.ecoe);
      this.getSelectedShift();
      this.getSelectedRound();
    } else {
      this.authService.logout();
    }
  }

  onChangeShiftDay($event) {
    this.filteredShifts = this.shifts.filter( x => {
        if (this.getStringDate(x.timeStart) === $event) {
          return x;
        }
    });
    this.setSelectedShift($event);
  }

  onChangeRound(round: Round) {
    this.setSelectedRound(round);
  }

  doSpinning(timeout: number) {
    this.isSpinning = true;
    this.cdRef.detectChanges();
    setTimeout(() => {
      this.isSpinning = false;
    }, timeout);
  }

  getSelectedShift() {
    if (sessionStorage.getItem('selectedIndexShift')) {
      const json = JSON.parse(sessionStorage.getItem('selectedIndexShift'));
      if (json['ecoeId'] && json['ecoeId'] === this.ecoeId) {
        this.selectedIndexShift = parseInt(json['selectedIndexShift'], 10);
      }
    }
  }

  getSelectedRound() {
    if (sessionStorage.getItem('selectedIndexRound')) {
      const json = JSON.parse(sessionStorage.getItem('selectedIndexRound'));
      if (json['ecoeId'] && json['ecoeId'] === this.ecoeId) {
        this.selectedIndexRound = parseInt(json['selectedIndexRound'], 10);
      }
    }
  }

  setSelectedShift($event) {
    const selectedIndexShift = JSON.stringify( {ecoeId: this.ecoeId, selectedIndexShift: this.shiftDays.indexOf($event)});
    sessionStorage.setItem('selectedIndexShift', selectedIndexShift);
  }

  setSelectedRound(round: Round) {
    const sessionSelectedIndexRound = sessionStorage.getItem('selectedIndexRound');
    let savedIndex;

    if (sessionSelectedIndexRound) {
      savedIndex = parseInt(JSON.parse(sessionSelectedIndexRound)['selectedIndexRound'], 10);
    }

    if (!sessionStorage.getItem('selectedIndexRound') || savedIndex !== this.rounds.indexOf(round) ) {
      const selectedIndexRound = JSON.stringify( {ecoeId: this.ecoeId, selectedIndexRound: this.rounds.indexOf(round)});
      sessionStorage.setItem('selectedIndexRound', selectedIndexRound);
      this.doSpinning(300);
    }
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
