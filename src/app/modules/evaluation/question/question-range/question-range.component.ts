import {Component, Input, OnInit} from '@angular/core';
import {Answer, AnswerRange, AnswerSchema, Question, QuestionRange, Station, Student} from '@app/models';
import {QuestionBaseComponent} from '@app/modules/evaluation/question/question-base/question-base.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-question-range',
  templateUrl: './question-range.component.html',
  styleUrls: ['./question-range.component.less']
})
export class QuestionRangeComponent extends QuestionBaseComponent implements OnInit {

  @Input() questiondesc: Question;
  @Input() question: QuestionRange;
  @Input() station?: Station = null;
  @Input() student?: Student = null;


  selected: number;
  
  _questionSchema: QuestionRange = null;
  _questionAnswer: Answer = null;
  loading: boolean=true;

  constructor(protected message: NzMessageService,
              protected translate: TranslateService) {
    super(message, translate);
  }

  ngOnInit() {
    this._questionSchema = this.questiondesc.schema as QuestionRange;
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

  async findAnswer(questiondesc: Question, answersList: Array<Answer>): Promise<Answer> {
    this.loading = true;
    let _answer = null;
    if (answersList) {
      // console.log(question.id, 'findAnswer for Question:', question, 'in', answersList);
      _answer = answersList.find(answer => answer.question.equals(this.question));
      _answer = _answer || await this.createAnswer(questiondesc)
    }
    this.loading = false;
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
