import {Component, OnInit} from '@angular/core';
import {ECOE, Round} from '../../../models';
import {ActivatedRoute, Router} from '@angular/router';
import {error} from 'util';
import {TranslateService} from '@ngx-translate/core';
import {AuthenticationService} from '../../../services/authentication/authentication.service';
import {ChronoService} from '../../../services/chrono/chrono.service';

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

  constructor(private route: ActivatedRoute,
              private translate: TranslateService,
              private authService: AuthenticationService,
              private chronoService: ChronoService,
              private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.ecoeId = +params.ecoeId;
      this.getECOE();
      this.getRounds();
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
    this.router.navigate(['./home']).finally();
  }

  draftECOE(ecoeId: number) {
    this.chronoService.draftECOE(ecoeId).toPromise()
      .catch(err => console.warn(err));
  }

  startECOE() {
    this.chronoService.startECOE(this.ecoeId)
      .subscribe( null, (err) => {
        if (err && err.status === 409) {
          this.errorAlert = this.translate.instant('ECOE_ALREADY_RUNNING');
          setTimeout(() => this.errorAlert = null, 3000);
        }
      });
  }

  pauseECOE(id: number) {
    this.chronoService.pauseECOE(id)
      .subscribe(null, err => error(err));
  }

  playECOE(id: number) {
    this.chronoService.playECOE(id)
      .subscribe(null, err => error(err));
  }

  stopECOE(id: number) {
    this.chronoService.abortECOE(id)
      .subscribe(null, err => error(err));

    this.disabledBtnStart = true;

    setTimeout(() => {
      this.disabledBtnStart = false;
      this.clearAlertError();
    }, 1000);
  }

  playRound(round: number) {
    this.chronoService.playRound(round)
      .subscribe(null, err => error(err));
  }

  pauseRound(roundId: number) {
    this.chronoService.pauseRound(roundId)
      .subscribe(null, err => error(err));
  }

  private clearAlertError() {
    this.errorAlert = null;
  }

  private setSpin(value: boolean) {
    this.doSpin =  value;

    setTimeout(() => this.doSpin = false, 1000);
  }
}
