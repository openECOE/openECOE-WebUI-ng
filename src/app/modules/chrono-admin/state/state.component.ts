import {Component, OnInit} from '@angular/core';
import {ECOE, Round} from '../../../models';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {AuthenticationService} from '../../../services/authentication/authentication.service';
import {ChronoService} from '../../../services/chrono/chrono.service';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.less'],
  providers: [ChronoService]
})
export class StateComponent implements OnInit {
  ecoe: ECOE;
  ecoeId: number;
  rounds: Round[] = [];
  disabledBtnStart: boolean;
  errorAlert: string;
  doSpin: boolean = false;
  changing_state: Boolean = false;
  ecoeStarted: boolean = false;
  paused: boolean;
  pauses: { [key: number]: boolean } = {};

  constructor(private route: ActivatedRoute,
              private translate: TranslateService,
              private authService: AuthenticationService,
              private chronoService: ChronoService,
              private router: Router,
              private modalSrv: NzModalService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.ecoeId = +params.ecoeId;
      this.getECOE();
      this.getRounds();
      this.loadState();
    });
  }

  getECOE() {
    ECOE.fetch(this.ecoeId)
      .then((result: ECOE) => this.ecoe = result);
  }

  getRounds() {
    Round.query({where: {ecoe: +this.ecoeId}}, {cache: false, skip: ['ecoe']})
      .then( (result: Round[]) => this.rounds = result);
  }

  onBack() {
    this.saveState();
    this.router.navigate(['./home']).finally();
  }

  startECOE() {
    this.chronoService.startECOE(this.ecoeId)
      .subscribe(null, (err) => {
        if (err && err.status === 409) {
          this.errorAlert = this.translate.instant('ECOE_ALREADY_RUNNING');
          setTimeout(() => this.errorAlert = null, 3000);
        }
      });
    this.ecoeStarted = true;
    this.saveState();
  }

  pauseECOE(id: number) {
    this.chronoService.pauseECOE(id)
      .subscribe(() => {
        this.rounds.forEach(round => {
          this.pauses[round.id] = true;
        });
      }, err => console.error(err));
    this.paused = true;
    this.saveState();
  }

  playECOE(id: number) {
    this.chronoService.playECOE(id)
      .subscribe(() => {
        this.rounds.forEach(round => {
          this.pauses[round.id] = false;
        });
      }, err => console.error(err));
    this.paused = false;
    this.saveState();
  }

  stopECOE(id: number) {
    this.chronoService.abortECOE(id)
      .subscribe(null, err => console.error(err));

    this.disabledBtnStart = true;
    this.ecoeStarted = false;
    this.paused = false;

    setTimeout(() => {
      this.disabledBtnStart = false;
      this.clearAlertError();
    }, 1000);

    this.saveState();
  }

  playRound(roundId: number) {
    this.chronoService.playRound(roundId)
      .subscribe(null, err => console.error(err));
    this.pauses[roundId] = false;
    this.saveState();
  }

  pauseRound(roundId: number) {
    this.chronoService.pauseRound(roundId)
      .subscribe(null, err => console.error(err));
    this.pauses[roundId] = true;
    this.saveState();
  }

  clearAlertError() {
    this.errorAlert = null;
  }

  setSpin(value: boolean) {
    this.doSpin = value;

    setTimeout(() => this.doSpin = false, 1000);
  }

  publishECOE() {
    this.changing_state = true;
    this.chronoService.publishECOE(this.ecoeId).toPromise()
      .then(result => this.reloadECOE())
      .catch(err => {
        console.warn(err);
        this.modalSrv.error({
          nzMask: false,
          nzTitle: this.translate.instant('ERROR_ACTION_STATE_PUBLISH')
        });  
      })
      .finally(() => {
        this.changing_state = false;
      });
  }

  draftECOE() {
    this.changing_state = true;
    this.chronoService.draftECOE(this.ecoeId).toPromise()
    .then(result => this.reloadECOE())
    .catch(err => {
      console.warn(err);
      this.modalSrv.error({
        nzMask: false,
        nzTitle: this.translate.instant('ERROR_ACTION_STATE_DRAFT')
      });  
    })
    .finally(()=>{
      this.changing_state = false;
    })
  }

  reloadECOE() {
    ECOE.fetch<ECOE>(this.ecoeId, {cache: false}).then(value => {
      this.ecoe = value;
    });
  }

  saveState() {
    const state = {
      ecoeStarted: this.ecoeStarted,
      paused: this.paused,
      pauses: this.pauses
    };
    localStorage.setItem(`ecoeState_${this.ecoeId}`, JSON.stringify(state));
  }

  loadState() {
    const state = localStorage.getItem(`ecoeState_${this.ecoeId}`);
    if (state) {
      const { ecoeStarted, paused, pauses } = JSON.parse(state);
      this.ecoeStarted = ecoeStarted;
      this.paused = paused;
      this.pauses = pauses;
    }
  }
}


  