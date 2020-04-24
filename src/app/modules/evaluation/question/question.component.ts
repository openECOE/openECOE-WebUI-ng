import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Answer, AnswerSchema, Option, Question, QuestionBase, QuestionCheckBox, QuestionRadio, Station, Student} from '@app/models';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.less']
})
export class QuestionComponent implements OnInit, OnChanges {

  @Input() question: Question;
  @Input() station?: Station = null;
  @Input() student?: Student = null;
  @Input() answers?: Array<Answer> = null;

  _questionSchema: QuestionBase = null;
  _questionAnswer: Answer = null;
  loading: boolean = true;

  constructor() {
  }

  ngOnInit() {
    this._questionSchema = this.question.schema as QuestionBase;
    this.findAnswer(this.question, this.answers).then(answer => this._questionAnswer = answer);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.answers && changes.answers.currentValue) {
      this.findAnswer(this.question, changes.answers.currentValue).then(answer => this._questionAnswer = answer);
    }
  }

  async findAnswer(question: Question, answersList: Array<Answer>): Promise<Answer> {
    this.loading = true;
    let _answer = null;
    if (answersList) {
    _answer = answersList.find(answer => answer.question.equals(this.question));
    _answer = _answer ? _answer :
      await new Answer({
        station: this.station,
        student: this.student,
        question: this.question,
        schema: new AnswerSchema(question.schema.type)
      }).save();
    }
    this.loading = false;
    return _answer;
  }

}
