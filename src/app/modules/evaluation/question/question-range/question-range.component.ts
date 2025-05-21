import {Component, Input, OnInit} from '@angular/core';
import {Answer, AnswerRange, QuestionRange} from '@app/models';
import {QuestionBaseComponent} from '@app/modules/evaluation/question/question-base/question-base.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import {TranslateService} from '@ngx-translate/core';
import {ServerStatusService} from '@app/services/server-status/server-status.service';
@Component({
  selector: 'app-question-range',
  templateUrl: './question-range.component.html',
  styleUrls: ['./question-range.component.less']
})
export class QuestionRangeComponent extends QuestionBaseComponent implements OnInit {

  @Input() question: QuestionRange;

  selected: number;

  constructor(protected message: NzMessageService,
              protected translate: TranslateService,
              protected serverStatus: ServerStatusService) {
    super(message, translate, serverStatus);
  }

  ngOnInit() {

  }

  loadSelected(answer: Answer) {
    if (answer) {
      this.selected = (answer.schema as AnswerRange).selected;
    }
  }

  changeAnswer(answer: Answer, value: number) {
    if (answer) {
      this.selected = value;
      (answer.schema as AnswerRange).selected = value;
      answer.points = (this.question.max_points / this.question.range) * value;
      this.saveAnswer(answer);
    }
  }

}
