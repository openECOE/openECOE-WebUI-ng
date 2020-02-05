import {Component, OnInit} from '@angular/core';
import {ECOE, Round} from '../../../../models';
import {ActivatedRoute, Router} from '@angular/router';
import {error} from 'util';
import {TranslateService} from '@ngx-translate/core';
import {AuthenticationService} from '../../../../services/authentication/authentication.service';
import {ChronoService} from '../../../../services/chrono/chrono.service';

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.less']
})
export class StateComponent implements OnInit {
  private ecoe: ECOE;
  private ecoeId: number;
  private rounds: Round[] = [];
  private disabledBtnStart: boolean;
  private errorAlert: string;

  constructor(private route: ActivatedRoute,
              private translate: TranslateService,
              private authService: AuthenticationService,
              private chronoService: ChronoService,
              private router: Router) { }

  ngOnInit() {
    if (this.authService.userLogged) {
      this.ecoeId = this.route.snapshot.params.id;
      this.getECOE();
      this.getRounds();
    } else {
      this.authService.logout();
    }
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

  publishECOE(ecoeId: number) {
    this.chronoService.publishECOE(ecoeId).toPromise()
      .then(result => {
        console.log('published', result);
      })
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

  stopECOE() {
    this.chronoService.abortECOE()
      .subscribe(null, err => error(err));

    this.disabledBtnStart = true;

    setTimeout(() => {
      this.disabledBtnStart = false;
      this.clearAlertError();
    }, 1000);
  }

  clearAlertError() {
    this.errorAlert = null;
  }

  pauseRound(round?: number) {
    this.chronoService.pauseECOE(round)
      .subscribe(null, err => error(err));
  }

  playRound(round?: number) {
    this.chronoService.playECOE(round)
      .subscribe(null, err => error(err));
  }
}
