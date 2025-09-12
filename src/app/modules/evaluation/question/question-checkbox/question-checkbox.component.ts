import {Component, Input, OnInit} from '@angular/core';
import {Answer, AnswerCheckBox, AnswerSchema, Question, QuestionCheckBox, QuestionOption, Station, Student} from '@app/models';
import {QuestionBaseComponent} from '@app/modules/evaluation/question/question-base/question-base.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import {TranslateService} from '@ngx-translate/core';

class CheckBoxOption {
  constructor(option: QuestionOption, checked: boolean) {
    this.option = option;
    this.checked = checked;

    this.option.points = Number(this.option.points)
  }

  option: QuestionOption;
  checked: boolean;
  get class() {
    return this.option.points < 0 ? 'negative-points':'positive-points'
  }
}

@Component({
  selector: 'app-question-checkbox',
  templateUrl: './question-checkbox.component.html',
  styleUrls: ['./question-checkbox.component.less']
})
export class QuestionCheckboxComponent extends QuestionBaseComponent implements OnInit {
  @Input() questiondesc: Question;
  @Input() question: QuestionCheckBox;
  @Input() station?: Station = null;
  @Input() student?: Student = null;

  _questionSchema: QuestionCheckBox = null;
  _checkBoxes: Array<CheckBoxOption> = [];

  constructor(protected message: NzMessageService,
              protected translate: TranslateService) {
    super(message, translate);
  }

  ngOnInit() {
    this._questionSchema = this.questiondesc.schema as QuestionCheckBox;
    this._checkBoxes = this.loadQuestion(this.question);
  }

  loadQuestion(question: QuestionCheckBox): Array<CheckBoxOption> {
    const _cbList: Array<CheckBoxOption> = [];
    for (const opt of question.options) {
      _cbList.push(new CheckBoxOption(opt, false));
    }
    return _cbList;
  }

  loadSelected(answer: Answer) {
    if (answer) {
      const _selected = (answer.schema as AnswerCheckBox).selected;
      for (const check of this._checkBoxes) {
        check.checked = !!(_selected ? _selected : []).find(value => value.id_option === check.option.id_option);
      }
    }
  }

  async changeAnswer(answer: Answer, checkBoxOption: CheckBoxOption, checked: boolean) {
    checkBoxOption.checked = checked;

    if (answer) {
      const _cbFiltered = this._checkBoxes.filter(cbOption => cbOption.checked);

      const _sumPoints = _cbFiltered.reduce<number>((points, opt2) => {
        return points + opt2.option.points
      }, 0);

      answer.points = _sumPoints;
      (answer.schema as AnswerCheckBox).selected = _cbFiltered.map(optionChecked => ({id_option: optionChecked.option.id_option}));     

      this.answer = await this.saveAnswer(answer).finally();
    }
  }

  
    async findAnswer(questiondesc: Question, answersList: Array<Answer>): Promise<Answer> {
      //this.loading = true;
      let _answer = null;
      if (answersList) {
        // console.log(question.id, 'findAnswer for Question:', question, 'in', answersList);
        _answer = answersList.find(answer => answer.question.equals(this.question));
        _answer = _answer || await this.createAnswer(questiondesc)
      }
      //this.loading = false;
      return _answer;
    }
  
    async createAnswer(questiondesc: Question) {
      const _answer = new Answer({
        station: this.station,
        student: this.student,
        questiondesc: this.questiondesc,
        schema: new AnswerSchema(questiondesc.schema.type)
      })
  
      return _answer
    }
}
