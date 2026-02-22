import { Input, OnInit, Directive } from '@angular/core';
import {Answer, QuestionBase} from '@app/models';
import { NzMessageService } from 'ng-zorro-antd/message';
import {TranslateService} from '@ngx-translate/core';
import {ServerStatusService} from '@app/services/server-status/server-status.service';
import { getServers } from 'dns';
import { is } from 'date-fns/locale';
@Directive()
export class QuestionBaseComponent implements OnInit {
  protected _answer: Answer = null;

  protected isOnline: boolean = true;

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
              protected serverStatus: ServerStatusService) {
  }

  ngOnInit() {

  
    // Load question init values
    this.loadQuestion(this.question);
    const questionSchema = this.question as QuestionBase;
     // recuperar respuestas si hay conexion

    this.serverStatus.isAvailable.subscribe(value => {
      this.isOnline = value;

      if(value)
      {
      console.log('conexion activa?', value);
      localStorage.getItem('answers');

        this.recuperarRespuestasGuardadas();
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
  
  saveAnswer(answer: Answer): Promise<Answer> {
    return new Promise<Answer>((resolve, reject) => {

      if(!this.isOnline)
      {
           // Save answer to local storagechrome
          const respuestasGuardadas = JSON.parse(localStorage.getItem('answers')) || [];
          const respuestasActualizadas = respuestasGuardadas.filter((a: any) => a.question !== answer.question);
          respuestasActualizadas.push(answer);
          localStorage.setItem('answers', JSON.stringify(respuestasActualizadas));
          console.log('Answer saved to local storage:', respuestasGuardadas);
      }
      else
          // Save answer to server
        answer.save()
        .then(value => {
          this.answer = value
          resolve(value)
        })
        .catch(reason => {
          this.message.error(
            this.translate.instant('ANSWER_SAVING_ERROR', {questionName: this.question.description}),
            {nzDuration: 30});
          console.error(reason);
          reject(reason);

        });
    });
  }

  loadselected(answer: Answer) {
    if (!answer || !this.question) {
      (this._questionAnswer = answer.value);
      this.answer = answer;
    }
  }
  
  recuperarRespuestasGuardadas() {

  const respuestas = JSON.parse(localStorage.getItem('answers') || '[]');
  const respuestasGuardadas = respuestas.find((a: any) => a.question === this.question);
  this.saveAnswer(this.answer)
  if(respuestasGuardadas)
    {
    this.loadSelected(respuestasGuardadas);
    console.log("respuesta guardada")
    }
  }
}
