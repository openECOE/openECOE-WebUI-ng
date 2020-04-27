import {Component, Input, OnInit} from '@angular/core';
import {Answer, AnswerCheckBox, AnswerRadio, QuestionCheckBox, QuestionOption, QuestionRadio} from '@app/models';
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

  changeRadioAnswer(answer: Answer, id_option: number, checked: boolean = true) {
    if (answer) {
      (answer.schema as AnswerRadio).selected = checked ? (id_option != null ? {id_option: id_option} : null) : null;
      this.saveAnswer(answer)
        .catch(reason => console.error(reason));
    }
  }

}
