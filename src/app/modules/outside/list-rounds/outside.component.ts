import { Component, OnDestroy, OnInit } from '@angular/core';
import { ECOEConfig, InfoData } from '../../../models/chrono';
import { Subscription } from 'rxjs';
import { ChronoService } from '../../../services/chrono/chrono.service';

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

  constructor(private chronoService: ChronoService) {}

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
    this.organizationsList = this.ecoesConfig.map(key => {
        const orgId = key.ecoe.organization;
        const orgName = key.ecoe.organization_name;
        return { id: orgId, name: orgName };
      });

      this.chronosToShow();
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
