import { Component, OnInit } from '@angular/core';
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
  private ecoeName: string;
  private roundDescription: string;

  private config: ECOEConfig;

  constructor(private route: ActivatedRoute,
              private chronoService: ChronoService,
              private location: Location) { }

  async ngOnInit() {
    this.ecoeId = this.route.snapshot.params.ecoeId;
    this.roundId = this.route.snapshot.params.roundId;

    this.chronoService.getChronoConfiguration(this.ecoeId)
      .toPromise()
      .then(result => {
        this.config = result[0] || null;

        if (!this.config) {return; }

        this.ecoeName = this.config.ecoe.name;
        const auxRound = (this.config.rounds.filter(item => +item.id === +this.roundId));
        this.roundDescription = (auxRound.length > 0) ? auxRound[0].name : null;
      });
  }

  onBack() {
    this.location.back();
  }
}
