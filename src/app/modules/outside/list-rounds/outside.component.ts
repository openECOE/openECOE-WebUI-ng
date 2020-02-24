import {Component, OnDestroy, OnInit} from '@angular/core';

import {ECOEConfig, InfoData} from '../../../models/chrono';
import {Subscription} from 'rxjs';
import {ChronoService} from '../../../services/chrono/chrono.service';
import {AuthenticationService} from '../../../services/authentication/authentication.service';

@Component({
  selector: 'app-outside',
  templateUrl: './outside.component.html',
  styleUrls: ['./outside.component.less'],
  providers: [ChronoService]
})
export class OutsideComponent implements OnInit, OnDestroy {
  private ecoesConfig: ECOEConfig[] = [];
  selectedRound: InfoData;
  selectedConfig: ECOEConfig;

  private chronoSubs: Subscription;
  private authenticated: boolean;

  constructor(private chronoService: ChronoService,
              private authenticationService: AuthenticationService) {}

  ngOnInit() {
    this.chronoSubs = this.chronoService.getChronoConfiguration()
      .subscribe(
      (result: ECOEConfig[]) => {
        if (result && result.length > 0) {
          this.ecoesConfig = result;
          this.onChangeRound(this.ecoesConfig[0].rounds[0]);
        }
      }, error => {
        console.warn(error);
      }
    );
    this.authenticated = this.authenticationService.userLogged;
  }

  onChangeRound(round: InfoData) {
    this.selectedRound = round;
    this.selectedConfig = this.ecoesConfig.filter(item => item.rounds.indexOf(round) > -1)[0];
  }

  ngOnDestroy() {
    if (this.chronoSubs) {
      this.chronoSubs.unsubscribe();
    }
  }
}
