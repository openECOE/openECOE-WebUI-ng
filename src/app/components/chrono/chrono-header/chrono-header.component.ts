import {Component, Input, OnInit} from '@angular/core';
import {Round} from '../../../models';
import {EvaluationService} from '../../../services/evaluation/evaluation.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-chrono-header',
  templateUrl: './chrono-header.component.html',
  styleUrls: ['./chrono-header.component.less']
})
export class ChronoHeaderComponent implements OnInit {

  @Input() showDetails: boolean = true;
  @Input() minutes: number = 0;
  @Input() seconds: number = 0;
  @Input() stageName: string;
  @Input() rerunsDescription: string;
  @Input() round: Round;
  @Input() idEcoe: number;
  @Input() currentCountDownEvent: {event: {}, minutes: number, seconds: number} = { event: null, minutes: 0, seconds: 0};

  constructor(private evalService: EvaluationService,
              private router: Router) { }

  ngOnInit() {
  }

  goEvaluation(roundId, ecoeId: number) {
    if (ecoeId) {
      this.evalService.setSelectedRound(roundId, ecoeId);
      this.router.navigate(['/eval/ecoe/', ecoeId]).finally();
    }
  }

}
