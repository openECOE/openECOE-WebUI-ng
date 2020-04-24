import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Answer, AnswerCheckBox, QuestionBase, QuestionCheckBox} from '@app/models';
import {NzMessageService} from 'ng-zorro-antd';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-question-base',
  templateUrl: './question-base.component.html',
  styleUrls: ['./question-base.component.less']
})
export class QuestionBaseComponent implements OnInit, OnChanges {

  @Input() question: QuestionBase;
  @Input() answer?: Answer;

  constructor(protected message: NzMessageService,
              protected translate: TranslateService) {
  }

  ngOnInit() {
    // Load question init values
    this.loadQuestion(this.question);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // this.loadSelected(changes.answer.currentValue, this._checkBoxes).then(cbArray => this._checkBoxes = [...cbArray]);
    if (changes.answer) {
      // Reload selected values
      this.loadSelected(this.answer);
    }

  }

  loadQuestion(question: QuestionBase) {
    // Create any additional structure needed for the template
  }

  loadSelected(answer: Answer) {
    if (answer) {
      // Logic to assign selected values
    }
  }

  saveAnswer(answer: Answer) {
    answer.save()
      .then(value => this.answer = value)
      .catch(reason => {
        this.message.error(
          this.translate.instant('ANSWER_SAVING_ERROR', {questionName: this.question.description}),
          {nzDuration: 0});
        console.error(reason);
      });
  }

}
