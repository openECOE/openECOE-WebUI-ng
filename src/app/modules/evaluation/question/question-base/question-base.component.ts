import { Input, OnInit, Directive } from '@angular/core';
import {Answer, QuestionBase, Station} from '@app/models';
import { NzMessageService } from 'ng-zorro-antd/message';
import {TranslateService} from '@ngx-translate/core';
import {ServerStatusService} from '@app/services/server-status/server-status.service';
import { getServers } from 'dns';
import { is } from 'date-fns/locale';
import { QuestionOfflineService } from '@app/services/questions/question-offline.service';
import { guardedExpression } from '@angular/compiler/src/render3/util';
@Directive()
export class QuestionBaseComponent implements OnInit {
  protected _answer: Answer = null;

  protected isOnline: boolean = true;
   recuperarconexion: boolean = false;
  @Input() question: QuestionBase;
   _questionAnswer: Answer = null;

  @Input()
  set answer(answer: Answer) {
    this._answer = answer;
    this.loadSelected(answer);
  }

  get answer(): Answer {
    return this._answer;
  }

  constructor(protected message: NzMessageService,
              protected translate: TranslateService,
              protected serverStatus: ServerStatusService,
              protected questionOnline: QuestionOfflineService) {
  }

  ngOnInit() {

    console.log("entra al ngonint")
    // Load question init values
    this.loadQuestion(this.question);
    const questionSchema = this.question as QuestionBase;
      this.serverStatus.isAvailable.subscribe(value => {
      this.isOnline = value;

      if(value)
      {
        this.loadSelected(this.answer);
      console.log('conexion activa?', value);
      if(this.recuperarconexion)
      { 
        this.questionOnline.saveAnswer(this.answer);
        console.log('respuestas guardadas en el servidor');
        window.location.reload();
        this.recuperarconexion = false;

      }
      }
      else
      {
         this.recuperarconexion = true;
      }
      
      
      });
     
        
}

  loadQuestion(question: QuestionBase) {
    // Create any additional structure needed for the template
  }

  loadSelected(answer: Answer) {
    if (answer) {
      // Logic to assign selected values
    }
  }
  

  loadselected(answer: Answer) {
    if (answer && this.question) {
      (this._questionAnswer = answer.value);
      this.answer = answer;
    }
  }
  
}
