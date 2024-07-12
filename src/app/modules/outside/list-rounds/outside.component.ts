import { Component, OnDestroy, OnInit } from '@angular/core';
import { ECOEConfig, InfoData } from '../../../models/chrono';
import { Subscription } from 'rxjs';
import { ChronoService } from '../../../services/chrono/chrono.service';
import { ApiService } from '@app/services/api/api.service';

interface Organization {
  id: number;
  name: string;
  chronos?: ECOEConfig[];
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
  chronoSubs: Subscription;

  constructor(private chronoService: ChronoService, private api: ApiService) {}

  ngOnInit() {
    this.chronoSubs = this.chronoService.getChronoConfiguration().subscribe(
      (result: ECOEConfig[]) => {
        if (result && result.length > 0) {
          this.ecoesConfig = result;
          this.onChangeRound(this.ecoesConfig[0].rounds[0]);
          this.getOrganizations();
        }
      },
      error => {
        console.warn(error);
      }
    );
  }

  getOrganizations() {
    this.api.getResource('organizations').subscribe(
      (response: any) => {
        this.organizationsList = Object.keys(response).map(key => {
          const organization = response[key];
          const id = parseInt(organization.$uri.split('/').pop());
          return { id, name: organization.name };
        });
        this.chronosToShow();
      },
      error => {
        console.warn(error);
      }
    );
  }
  
  chronosToShow() {
    if (!this.organizationsList.length || !this.ecoesConfig.length) {
      return;
    }
  
    this.ecoesConfig.reverse();
    
    const orgMap = new Map<number, ECOEConfig[]>();
    
    this.ecoesConfig.forEach(ecoe => {
      const orgId = ecoe.ecoe.organization;
      if (!orgMap.has(orgId)) {
        orgMap.set(orgId, []);
      }
      orgMap.get(orgId).push(ecoe);
    });
    
    this.organizationsList = this.organizationsList
      .map(org => {
        const chronos = orgMap.get(org.id) || [];
        return {
          ...org,
          chronos
        };
      })
      .filter(org => org.chronos.length > 0);
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
