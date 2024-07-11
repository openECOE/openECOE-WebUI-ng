import {Component, OnDestroy, OnInit} from '@angular/core';

import {ECOEConfig, InfoData} from '../../../models/chrono';
import {Subscription} from 'rxjs';
import {ChronoService} from '../../../services/chrono/chrono.service';
import { ApiService } from '@app/services/api/api.service';
import { ECOE } from '@app/models';
//import { Organization } from '@app/models';

interface Organization {
  $uri: any;
  name: string;
}
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
  organizationsList: Organization[] = [];
  ecoesList: ECOE[] = [];

  chronoSubs: Subscription;

  constructor(private chronoService: ChronoService,
              private api: ApiService
  ) {}

  ngOnInit() {
    this.chronoSubs = this.chronoService.getChronoConfiguration()
      .subscribe(
      (result: ECOEConfig[]) => {
        if (result && result.length > 0) {
          this.ecoesConfig = result;
          console.log("Config 1", this.ecoesConfig);
          this.onChangeRound(this.ecoesConfig[0].rounds[0]);
        }
      }, error => {
        console.warn(error);
      }
    );
    this.getOrganizations();
    this.getEcoes();
  }

  getOrganizations() {
    this.api.getResource("organizations").subscribe(
      (response: any) => {
        this.organizationsList = Object.keys(response).map(key => response[key]);
        console.log("Organizations", this.organizationsList);
      },
      (error) => {
        console.warn(error);
      }
    );
  }

  getEcoes() {
    this.api.getResource("ecoes").subscribe(
      (response: any) => {
        this.ecoesList = Object.keys(response).map(key => response[key]);
        console.log("Ecoes", this.ecoesList);
      },
      (error) => {
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
