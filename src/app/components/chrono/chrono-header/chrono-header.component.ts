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

  @Input() private showDetails: boolean = true;
  @Input() private round: Round;
  @Input() private minutes: number = 0;
  @Input() private seconds: number = 0;
  @Input() private idEcoe: number;
  @Input() private stageName: string;
  @Input() private rerunsDescription: string;
  @Input() private currentCountDownEvent: {event: {}, minutes: number, seconds: number} = { event: null, minutes: 0, seconds: 0};

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
