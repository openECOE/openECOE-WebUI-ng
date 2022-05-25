import {Component, Input, OnInit} from '@angular/core';
import {Answer, AnswerRange, QuestionRange} from '@app/models';
import {QuestionBaseComponent} from '@app/modules/evaluation/question/question-base/question-base.component';
import {NzMessageService} from 'ng-zorro-antd';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-question-range',
  templateUrl: './question-range.component.html',
  styleUrls: ['./question-range.component.less']
})
export class QuestionRangeComponent extends QuestionBaseComponent implements OnInit {

  @Input() question: QuestionRange;

  constructor(protected message: NzMessageService,
              protected translate: TranslateService) {
    super(message, translate);
  }

  ngOnInit() {
  }

  changeAnswer(answer: Answer, value: number) {
    if (answer) {
      (answer.schema as AnswerRange).selected = value;
      answer.points = (this.question.max_points / this.question.range) * value;
      this.saveAnswer(answer);
    }
  }

}
