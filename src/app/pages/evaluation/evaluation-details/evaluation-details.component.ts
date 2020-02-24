import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ECOE, Round, Shift, Station} from '../../../models';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import * as moment from 'moment';
import {SharedService} from '../../../services/shared/shared.service';
import {AuthenticationService} from '../../../services/authentication/authentication.service';
import {EvaluationService} from '../../../services/evaluation/evaluation.service';

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
  shifts: Shift[];
  private filteredShifts: Shift[] = [];
  private ecoeId: number;
  ecoe: ECOE;

  momentRef = moment;
  refresh: boolean = false;
  isSpinning: boolean = false;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private shared: SharedService,
              private cdRef: ChangeDetectorRef,
              private authService: AuthenticationService,
              private evalService: EvaluationService) { }

  async ngOnInit() {
    if (this.authService.userLogged) {
      this.momentRef.locale(this.shared.getUsersLocale('en-US'));
      this.ecoeId = +this.route.snapshot.params.id;
      this.ecoe = (await ECOE.fetch(this.ecoeId)) as ECOE;
      this.getData(this.ecoe).then(() => {
          this.getSelectedShift();
          this.onChangeShiftDay(this.shifts[this.selectedIndexShift]);
          this.getSelectedRound();
      });
    } else {
      this.authService.logout();
    }
  }

  onChangeShiftDay(shift: Shift) {
    this.filteredShifts = this.shifts.filter( x => {
        if (x.timeStart === shift.timeStart) {
          return x;
        }
    });
    this.setSelectedShift(shift);
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
    const selectedShiftId = this.evalService.getSelectedShift(this.ecoeId);
    if (selectedShiftId > 0) {
      this.selectedIndexShift = this.shifts.indexOf(this.shifts.filter(s => s.id === selectedShiftId)[0]);
    } else {
      this.selectedIndexShift = 0;
    }
  }

  getSelectedRound() {
    const selectedRoundId = this.evalService.getSelectedRound(this.ecoeId);
    if (selectedRoundId > 0) {
      this.selectedIndexRound = this.rounds.indexOf(this.rounds.filter(r => r.id === selectedRoundId)[0]);
    } else {
      this.selectedIndexRound = 0;
    }
  }

  setSelectedShift(shift: Shift) {
    this.evalService.setSelectedShift(shift, this.ecoeId);
  }

  setSelectedRound(round: Round) {
    this.evalService.setSelectedRound(round.id, this.ecoeId);
    this.doSpinning(300);
  }

  getData(ecoe: ECOE) {
    const roundsPromise = ecoe.rounds()
      .then((rounds: Round[]) => {
        this.rounds = rounds;
      });
    const shiftsPromise = ecoe.shifts()
      .then((shifts: any[]) => {
        this.shifts = shifts;
      });
    const stationsPromise = this.getStations();

    return Promise.all([roundsPromise, shiftsPromise, stationsPromise])
      .then(() => new Promise((resolve) =>
          resolve('OK')))
      .catch((err) => new Promise((resolve, reject) =>  reject(err)));
  }

  getStations() {
    return Station.query({
      where: {ecoe: this.ecoeId},
      sort: {order: false}
    }).then( (stations: Station[]) =>
      this.stations = stations);
  }

  onBack() {
    this.location.back();
  }
}
