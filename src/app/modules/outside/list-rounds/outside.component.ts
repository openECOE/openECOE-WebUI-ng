import {Component, OnDestroy, OnInit} from '@angular/core';

import {ECOEConfig, InfoData} from '../../../models/chrono';
import {Subscription} from 'rxjs';
import {ChronoService} from '../../../services/chrono/chrono.service';

@Component({
  selector: 'app-outside',
  templateUrl: './outside.component.html',
  styleUrls: ['./outside.component.less'],
  providers: [ChronoService]
})
export class OutsideComponent implements OnInit, OnDestroy {
  ecoesConfig: ECOEConfig[] = [];
  selectedRound: InfoData;
  selectedConfig: ECOEConfig;

  chronoSubs: Subscription;

  constructor(private chronoService: ChronoService) {}

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
