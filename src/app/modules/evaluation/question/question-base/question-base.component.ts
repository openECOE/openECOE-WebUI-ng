import {Input, OnInit} from '@angular/core';
import {Answer, QuestionBase} from '@app/models';
import {NzMessageService} from 'ng-zorro-antd';
import {TranslateService} from '@ngx-translate/core';

export class QuestionBaseComponent implements OnInit {
  private _answer: Answer = null;

  @Input() question: QuestionBase;

  @Input()
  set answer(answer: Answer) {
    this._answer = answer;
    this.loadSelected(answer);
  }

  get answer(): Answer {
    return this._answer;
  }

  constructor(protected message: NzMessageService,
              protected translate: TranslateService) {
  }

  ngOnInit() {
    // Load question init values
    this.loadQuestion(this.question);
  }

  loadQuestion(question: QuestionBase) {
    // Create any additional structure needed for the template
  }

  loadSelected(answer: Answer) {
    if (answer) {
      // Logic to assign selected values
    }
  }

  saveAnswer(answer: Answer): Promise<Answer> {
    return new Promise<Answer>((resolve, reject) => {
      answer.save()
        .then(value => {this.answer = value; resolve(value); })
        .catch(reason => {
          this.message.error(
            this.translate.instant('ANSWER_SAVING_ERROR', {questionName: this.question.description}),
            {nzDuration: 0});
          console.error(reason);
          reject(reason);
        });
    });
  }

}
