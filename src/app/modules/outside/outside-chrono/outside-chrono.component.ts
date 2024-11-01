import { Component, Input, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {ECOEConfig} from '../../../models/chrono';
import {ChronoService} from '../../../services/chrono/chrono.service';

@Component({
  selector: 'app-outside-chrono',
  templateUrl: './outside-chrono.component.html',
  styleUrls: ['./outside-chrono.component.less'],
  providers: [ChronoService]
})
export class OutsideChronoComponent implements OnInit {
  ecoeId: number;
  roundId: number;
  ecoeName: string;
  roundDescription: string;
  loop: boolean;

  private config: ECOEConfig;

  constructor(private route: ActivatedRoute,
              private chronoService: ChronoService,
              private location: Location) { }

  async ngOnInit() {
    this.ecoeId = this.route.snapshot.params.ecoeId;
    this.roundId = this.route.snapshot.params.roundId;
    
    this.fetchConfig();
  }

  async fetchConfig() {
    const result = await this.chronoService.getChronoConfiguration(this.ecoeId).toPromise();
    this.config = result[0] || null;
  
    if (!this.config) { return; }
  
    this.ecoeName = this.config.ecoe.name;
    const auxRound = this.config.rounds.filter(item => +item.id === +this.roundId);
    this.roundDescription = (auxRound.length > 0) ? auxRound[0].name : null;
  }

  getLoop(loop: boolean) {
    this.loop = loop;
  }

  onBack() {
    this.location.back();
  }
}
