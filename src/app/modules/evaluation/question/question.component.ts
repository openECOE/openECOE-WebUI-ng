import {Component, Input, OnInit} from '@angular/core';
import {Answer, AnswerSchema, Question, QuestionBase, Station, Student} from '@app/models';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.less']
})
export class QuestionComponent implements OnInit {
  private _answers: Array<Answer> = null;


  @Input() question: Question;
  @Input() station?: Station = null;
  @Input() student?: Student = null;

  @Input()
  set answers(answers: Array<Answer>) {
    this._answers = answers;
    this.findAnswer(this.question, answers).then(value => this._questionAnswer = value);
  }

  get answers(): Array<Answer> {
    return this._answers;
  }

// answers?: Array<Answer> = null;


  _questionSchema: QuestionBase = null;
  _questionAnswer: Answer = null;
  loading: boolean = true;

  constructor(
    private message: NzMessageService,
    private translate: TranslateService
  ) {
  }

  ngOnInit() {
    this._questionSchema = this.question.schema as QuestionBase;
  }

  async findAnswer(question: Question, answersList: Array<Answer>): Promise<Answer> {
    this.loading = true;
    let _answer = null;
    if (answersList) {
      // console.log(question.id, 'findAnswer for Question:', question, 'in', answersList);
      _answer = answersList.find(answer => answer.question.equals(this.question));
      _answer = _answer || await this.createAnswer(question)
    }
    this.loading = false;
    return _answer;
  }

  async createAnswer(question: Question) {
    const _answer = new Answer({
      station: this.station,
      student: this.student,
      question: this.question,
      schema: new AnswerSchema(question.schema.type)
    })

    _answer.save().catch(err => this.message.error(this.translate.instant('ERROR_SAVE_ANSWER', err)))
    return _answer
  }

}
