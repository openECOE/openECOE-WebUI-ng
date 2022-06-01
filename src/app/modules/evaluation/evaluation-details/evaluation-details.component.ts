import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ECOE, Round, Shift, Station} from '../../../models';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import * as moment from 'moment';
import {SharedService} from '@services/shared/shared.service';
import {AuthenticationService} from '@services/authentication/authentication.service';
import {EvaluationService} from '@services/evaluation/evaluation.service';

@Component({
  selector: 'app-evaluation-details',
  templateUrl: './evaluation-details.component.html',
  styleUrls: ['./evaluation-details.component.less']
})
export class EvaluationDetailsComponent implements OnInit {
  rounds: Round[] = [];
  stations: Station[] = [];

  ecoeDays: any[] = [];

  selectedIndexRound = 0;
  selectedIndexShift = 0;
  shifts: Shift[];
  filteredShifts: Shift[] = [];
  ecoeId: number;
  ecoe: ECOE;

  momentRef = moment;
  isSpinning: boolean = true;
  currentStep: number = 0;

  selectedEcoeDay;
  selectedRound: Round;
  selectedStation: Station;

  constructor(private route: ActivatedRoute,
              public location: Location,
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
      this.getData(this.ecoeId).then(() => {
          this.getShiftDays(this.shifts);
          this.getSelectedShift();
          // this.onChangeECOEDay(this.ecoeDays[this.selectedIndexShift]);
          this.getSelectedRound();
          this.isSpinning = false;
      });
    } else {
      this.authService.logout();
    }
  }

  checkForNextStep(items: any[]) {
    let selectedItem = null;
    if (items && items.length === 1) {
      selectedItem = items[0];
    }

    return selectedItem;
  }

  async getUrlParams() {
    try {
      const params = this.route.snapshot.params;

      this.ecoeId = +params['ecoeId'];
      this.selectedEcoeDay = params['date'];

      if (params['roundId'] && params['stationId']) {
        this.selectedRound = await Round.fetch(params['roundId'])

        this.selectedStation = await Station.fetch(params['stationId'],{skip: ['childrenStations']})
      }
    } catch (error) {
      console.error(error);
    }

  }

  setupCurrentStep() {
    this.currentStep = 0;
    if (this.selectedEcoeDay) {
      this.currentStep++;
      if (this.selectedRound) {
        this.currentStep++;
        if (this.selectedStation) {
          this.currentStep++;
        }
      }
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

    if (!this.selectedEcoeDay) {
      this.selectedEcoeDay = this.checkForNextStep(this.ecoeDays); 
    } else {
      this.onChangeECOEDay(this.selectedEcoeDay)
    }
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

  getData(ecoe: number) {
    const roundsPromise = Round.query({
      where: {'ecoe': ecoe}
    }).then((rounds: Round[]) => {
        this.rounds = rounds;
        if (!this.selectedRound) {this.selectedRound = this.checkForNextStep(rounds); }
      }).catch(err => {
        console.error('[EvaluationDetailsComponent]','getData()','Round.query',err);
        return err;
      });
    const shiftsPromise = Shift.query({
      where: {'ecoe': ecoe}
    }).then((shifts: any[]) => {
        this.shifts = shifts;
      }).catch(err => {
        console.error('[EvaluationDetailsComponent]','getData()','Shift.query',err);
        return err;
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
      sort: {order: false},
    }, {
      skip: ['parentStation', 'childrenStations']
    }).then(async (stations: Station[]) => {
      for (const station of stations) {
        const _eval = await station.can.evaluate()
        if (_eval) {
          this.stations.push(station);
        }
      }

      if (!this.selectedStation) {this.selectedStation = this.checkForNextStep(this.stations); }


      // const _stations = stations.filter(async (_station) => {
      //  const _eval = await _station.can.evaluate()
      //  return _eval;
      // })

      // this.stations = _stations;

      
    }).catch(err => {
      console.error('[EvaluationDetailsComponent]','getStations()',err);
      return err;
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
    this.onChangeECOEDay(this.selectedEcoeDay)
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
