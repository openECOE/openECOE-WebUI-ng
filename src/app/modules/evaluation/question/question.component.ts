import {Component, Input, OnInit} from '@angular/core';
import {Answer, AnswerSchema, Question, QuestionBase, Station, Student} from '@app/models';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';

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
    // Reset answer immediately to prevent showing previous student's selection
    this._questionAnswer = null;
    this.findAnswer(this.question, this._answers).then(value => this._questionAnswer = value);
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

  private getQuestionId(question: any): number | string {
    // Try to get ID from various possible locations
    if (question?.id) return question.id;
    if (question?.$uri) {
      // Extract ID from URI like "/questions/123"
      const match = question.$uri.match(/\/questions\/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    }
    return null;
  }

  async findAnswer(question: Question, answersList: Array<Answer>): Promise<Answer> {
    this.loading = true;
    let _answer = null;
    if (answersList) {
      // Use ID comparison instead of .equals() for more reliable matching
      const questionId = this.getQuestionId(this.question);
      _answer = answersList.find(answer => {
        const answerQuestionId = this.getQuestionId(answer.question);
        return answerQuestionId === questionId;
      });
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

    return _answer
  }

}
