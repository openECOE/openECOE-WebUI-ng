import {Component, Input, OnInit} from '@angular/core';
import {Answer, AnswerCheckBox, AnswerRadio, QuestionCheckBox, QuestionOption, QuestionRadio, Option} from '@app/models';
import {QuestionBaseComponent} from '@app/modules/evaluation/question/question-base/question-base.component';
import {NzMessageService} from 'ng-zorro-antd';
import {TranslateService} from '@ngx-translate/core';

class RadioOption {
  constructor(option: QuestionOption, checked: boolean) {
    this.option = option;
    this.checked = checked;
  }

  option: QuestionOption;
  checked: boolean;
}

@Component({
  selector: 'app-question-radio',
  templateUrl: './question-radio.component.html',
  styleUrls: ['./question-radio.component.less']
})
export class QuestionRadioComponent extends QuestionBaseComponent implements OnInit {

  @Input() question: QuestionRadio;

  _RadioOptions: Array<RadioOption> = [];

  constructor(protected message: NzMessageService,
              protected translate: TranslateService) {
    super(message, translate);
  }

  ngOnInit() {
    this._RadioOptions = this.loadQuestion(this.question);
  }

  loadQuestion(question: QuestionRadio): Array<RadioOption> {
    const _cbList: Array<RadioOption> = [];
    for (const opt of question.options) {
      _cbList.push(new RadioOption(opt, false));
    }
    return _cbList;
  }

  loadSelected(answer: Answer) {
    if (answer) {
      const _selected = (answer.schema as AnswerRadio).selected;
      for (const check of this._RadioOptions) {
        check.checked = _selected ? _selected.id_option === check.option.id_option : false;
      }
    }
  }

  changeRadioAnswer(answer: Answer, option: Option, checked: boolean) {
    if (answer) {
      if (checked && option) {
        (answer.schema as AnswerRadio).selected = {id_option: option.id};
        answer.points = option.points;
      } else {
        (answer.schema as AnswerRadio).selected = null;
        answer.points = 0
      }
      
      this.saveAnswer(answer)
        .catch(reason => console.error(reason));
    }
  }

}
