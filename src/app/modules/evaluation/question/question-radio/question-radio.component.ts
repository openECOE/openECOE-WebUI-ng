import {Component, Input, OnInit} from '@angular/core';
import {Answer, AnswerCheckBox, AnswerRadio, QuestionCheckBox, QuestionOption, QuestionRadio, Option} from '@app/models';
import {QuestionBaseComponent} from '@app/modules/evaluation/question/question-base/question-base.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import {TranslateService} from '@ngx-translate/core';
import {ServerStatusService} from '@app/services/server-status/server-status.service';

class RadioOption {
  constructor(option: QuestionOption, checked: boolean) {
    this.option = option;
    this.checked = checked;

    this.option.points = Number(this.option.points)
  }

  option: QuestionOption;
  checked: boolean;
  get class(): string {
    return this.option.points >= 0?'positive-points':'negative-points'
  }
}

@Component({
  selector: 'app-question-radio',
  templateUrl: './question-radio.component.html',
  styleUrls: ['./question-radio.component.less']
})
export class QuestionRadioComponent extends QuestionBaseComponent implements OnInit {

  @Input() question: QuestionRadio;

  RadioOptions: Array<RadioOption> = [];

  singleChecked: boolean = false;
  singleLabel: string;

  constructor(protected message: NzMessageService,
              protected translate: TranslateService,
              protected serverStatus: ServerStatusService) {
    super(message, translate, serverStatus);

  }

  ngOnInit() {
    this.RadioOptions = this.loadQuestion(this.question);
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
      this.singleChecked = false;
      const _schema = (answer.schema as AnswerRadio);

      if (typeof (_schema.selected) === 'string' && _schema.selected === '') {
        _schema.selected = null;
      }

      const _selected = _schema.selected;
      if (this.RadioOptions.length === 1) {
        this.singleChecked = _selected ? _selected.id_option === this.RadioOptions[0].option.id_option : false;
      } 
    }
  }
 
  changeRadioAnswer(answer: Answer, option: number, checked: boolean) {
    if (answer) {
      if (checked && option) {
        const _radioOption = this.RadioOptions.find(_radio => _radio.option.id_option === option);
        (answer.schema as AnswerRadio).selected = _radioOption.option;
        answer.points = _radioOption.option.points;
      } else {
        (answer.schema as AnswerRadio).selected = null;
        answer.points = 0
      }
      
      this.saveAnswer(answer)
        .then(newAnswer => this.answer = newAnswer)
        .catch(reason => console.error(reason));
    }
  }

}
