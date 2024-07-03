import {Component, OnInit, OnDestroy} from '@angular/core';
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
export class StateComponent implements OnInit, OnDestroy {
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
  checkInterval: any;

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
      this.getChronoStatus();
      this.startCheckStatusInterval();
    });
  }

  ngOnDestroy() {
    clearInterval(this.checkInterval);
  }

  startCheckStatusInterval() {
    this.checkInterval = setInterval(() => {
      this.checkIfAllRoundsCreated();
    }, 1000);
  }

  checkIfAllRoundsCreated() {
    this.chronoService.getChronoStatus(this.ecoeId).subscribe((status: any) => {
      const allCreated = Object.values(status).every((state: string) => state === "CREATED");
      if (allCreated) {
        this.ecoeStarted = false;
      }
    });
  }

  getECOE() {
    ECOE.fetch(this.ecoeId)
      .then((result: ECOE) => this.ecoe = result);
  }

  getRounds() {
    Round.query({where: {ecoe: +this.ecoeId}}, {cache: false, skip: ['ecoe']})
      .then((result: Round[]) => this.rounds = result);
  }

  getChronoStatus() {
    this.chronoService.getChronoStatus(this.ecoeId)
      .subscribe((status: any) => {
        console.log("Status: ", status);
        this.ecoeStarted = false;
        this.paused = true;
        this.pauses = {};

        for (const roundId in status) {
          const roundStatus = status[roundId];
          switch (roundStatus) {
            case "CREATED":
              this.pauses[roundId] = false;
              break;
            case "RUNNING":
              this.ecoeStarted = true;
              this.paused = false;
              this.pauses[roundId] = false;
              break;
            case "PAUSED":
              this.ecoeStarted = true;
              this.paused = true;
              this.pauses[roundId] = true;
              break;
            case "FINISHED":
            case "ABORTED":
              this.pauses[roundId] = true;
              break;
          }
        }
      });
  }

  onBack() {
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
  }

  pauseECOE(id: number) {
    this.chronoService.pauseECOE(id)
      .subscribe(() => {
        this.rounds.forEach(round => {
          this.pauses[round.id] = true;
        });
      }, err => console.error(err));
    this.paused = true;
  }

  playECOE(id: number) {
    this.chronoService.playECOE(id)
      .subscribe(() => {
        this.rounds.forEach(round => {
          this.pauses[round.id] = false;
        });
      }, err => console.error(err));
    this.paused = false;
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
  }

  playRound(roundId: number) {
    this.chronoService.playRound(roundId)
      .subscribe(null, err => console.error(err));
    this.pauses[roundId] = false;
    if (this.rounds.every(round => !this.pauses[round.id])) {
      this.paused = false;
    }
  }

  pauseRound(roundId: number) {
    this.chronoService.pauseRound(roundId)
      .subscribe(null, err => console.error(err));
    this.pauses[roundId] = true;

    if (this.rounds.every(round => this.pauses[round.id])) {
      this.paused = true;
    }
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
}
