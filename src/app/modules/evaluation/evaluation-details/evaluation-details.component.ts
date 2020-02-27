import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ECOE, Round, Shift, Station} from '../../../models';
import {ActivatedRoute, Router} from '@angular/router';
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

  ecoeDays: any[] = [];

  selectedIndexRound = 0;
  selectedIndexShift = 0;
  shifts: Shift[];
  private filteredShifts: Shift[] = [];
  private ecoeId: number;
  ecoe: ECOE;

  momentRef = moment;
  isSpinning: boolean = true;
  currentStep: number = 0;

  selectedEcoeDay;
  selectedRound: Round;
  selectedStation: Station;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private router: Router,
              private shared: SharedService,
              private cdRef: ChangeDetectorRef,

              private authService: AuthenticationService,
              private evalService: EvaluationService) { }

  async ngOnInit() {
    if (this.authService.userLogged) {
      this.momentRef.locale(this.shared.getUsersLocale('en-US'));
      await this.getUrlParams();
      this.setupCurrentStep();
      this.getData(this.ecoe).then(() => {
          this.getShiftDays(this.shifts);
          this.getSelectedShift();
          this.onChangeECOEDay(this.ecoeDays[this.selectedIndexShift]);
          this.getSelectedRound();
          this.isSpinning = false;
      });
    } else {
      this.authService.logout();
    }
  }

  getUrlParams() {
    const params = this.route.snapshot.params;

    this.ecoeId = +params['ecoeId'];
    this.selectedEcoeDay = params['date'];

    return  new Promise((resolve, reject) => {
      const ecoePromise = ECOE.fetch(this.ecoeId)
        .then((ecoe: ECOE) => this.ecoe = ecoe )
        .catch((err) => reject(err));

      if (params['roundId'] && params['stationId']) {
        const roundPromise = Round.fetch(params['roundId'])
          .then((round: Round) => this.selectedRound = round )
          .catch((err) => reject(err));

        const stationPromise = Station.fetch(params['stationId'])
          .then((station: Station) => this.selectedStation = station )
          .catch((err) => reject(err));

        Promise.all([roundPromise, stationPromise, ecoePromise]).then(() => resolve());
      } else {
        Promise.all([ecoePromise]).then(() => resolve());
      }
    });
  }

  setupCurrentStep() {
    this.currentStep = 0;
    if (this.selectedEcoeDay) {
      this.currentStep++;
    }
    if (this.selectedRound) {
      this.currentStep++;
    }
    if (this.selectedStation) {
      this.currentStep++;
    }
  }

  getShiftDays(shifts: Shift[]) {
    const aux_arr = [];
    shifts.forEach(shift => {
      const date = shift.timeStart.toISOString().split('T')[0];
      if ( aux_arr.indexOf(date) < 0 ) {
        aux_arr.push(date);
      }
    });
    this.ecoeDays = aux_arr;
  }

  onChangeECOEDay(shiftDate: string) {
    this.filteredShifts = this.shifts.filter( x => {
      const x_date = new Date(x.timeStart);
      const x_str_date =  x_date.toISOString().split('T')[0];

      if (x_str_date === shiftDate) {
        return x;
      }
    });
  }

  doSpinning(timeout: number) {
    this.isSpinning = true;
    this.cdRef.detectChanges();
    setTimeout(() => {
      this.isSpinning = false;
    }, timeout);
  }

  getSelectedShift() {
    const selectedShift = this.evalService.getSelectedShift(this.ecoeId);
    if (selectedShift) {
      this.selectedIndexShift = this.ecoeDays.indexOf(selectedShift);
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
    }).then( (stations: Station[]) => {
      this.stations = stations;
    });
  }

  onBack() {
    this.router.navigate(['/ecoe']);
  }

  finish() {
    this.onChangeECOEDay(this.selectedEcoeDay);
  }

  onEcoeDateSelected(item) {
    this.selectedEcoeDay = item;
    this.setupCurrentStep();
  }

  onRoundSelected(item) {
    this.selectedRound = item;
    this.setupCurrentStep();
  }

  onStationSelected(item) {
    this.selectedStation = item;
    this.finish();
    this.setupCurrentStep();
  }

  onClickDate() {
    if (this.selectedEcoeDay) {
      this.currentStep = 0;
    }
  }

  onClickRound() {
    if (this.selectedRound) {
      this.currentStep = 1;
    }
  }

  onClickStation() {
    if (this.selectedStation) {
      this.currentStep = 2;
    }
  }
}
