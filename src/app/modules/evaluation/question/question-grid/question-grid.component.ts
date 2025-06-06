import { Component, Input, OnInit } from '@angular/core';
import { QuestionBaseComponent } from '@app/modules/evaluation/question/question-base/question-base.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { Answer, QuestionOption, QuestionGrid, AnswerGrid, Station, Student, AnswerSchema, Question } from '@app/models';

class GridOption{
  constructor(option: QuestionOption, checked: boolean){
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
  selector: 'app-question-grid',
  templateUrl: './question-grid.component.html',
  styleUrls: ['./question-grid.component.less']
})
export class QuestionGridComponent extends QuestionBaseComponent implements OnInit{

  @Input() questiondesc: Question;
  @Input() question: QuestionGrid;
  @Input() station?: Station = null;
  @Input() student?: Student = null;
  selected: number;
  
  GridOptions: Array<GridOption>=[];
  
  singleChecked: boolean = false;
  singleLabel: string;

  // Parameters in case we need multiple rows/columns. Unused
 /* numberRows: number;
  numberCols: number;*/
  _questionSchema: QuestionGrid = null;
  _questionAnswer: Answer = null;
  //loading: boolean = true;

  constructor(protected message: NzMessageService,
              protected translate: TranslateService){
                super(message, translate);
              }
  ngOnInit() {
    this._questionSchema = this.questiondesc.schema as QuestionGrid;
    this.GridOptions = this.loadQuestion(this.question);
  }

  loadQuestion(question: QuestionGrid): Array<GridOption>{
    const _cbList: Array<GridOption>=[];
    for (const opt of question.options) {//Debugger tells me options array is not iterable. IDK why
          _cbList.push(new GridOption(opt, false));
        }
    return _cbList;
  }

  loadSelected(answer: Answer) {
      if (answer) {
        this.singleChecked = false;
        const _schema = (answer.schema as AnswerGrid);
  
        if (typeof (_schema.selected) === 'string' && _schema.selected === '') {
          _schema.selected = null;
        }
  
        const _selected = _schema.selected;
        if (this.GridOptions.length === 1) {
          this.singleChecked = _selected ? _selected.id_option === this.GridOptions[0].option.id_option : false;
        } 
      }
    }

  changeGridAnswer(answer: Answer, option: number, checked: boolean) {
      if (answer) {
        if (checked && option) {
          const _gridOption = this.GridOptions.find(_radio => _radio.option.id_option === option);
          (answer.schema as AnswerGrid).selected = _gridOption.option;
          answer.points = _gridOption.option.points;
        } else {
          (answer.schema as AnswerGrid).selected = null;
          answer.points = 0
        }
        
        this.saveAnswer(answer)
          .then(newAnswer => this.answer = newAnswer)
          .catch(reason => console.error(reason));
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
    /*
    async createAnswer(question: QuestionGrid){
      const _answer = new AnswerGrid()
      return _answer
    }*/
}
