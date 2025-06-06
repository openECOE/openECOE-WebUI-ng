import { Injectable } from '@angular/core';
import { ServerStatusService } from '../server-status/server-status.service';
import { json } from 'stream/consumers';
import { Input, OnInit, Directive } from '@angular/core';
import {Answer, QuestionBase} from '@app/models'; 
import { error } from 'console';
import {TranslateService} from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
@Injectable({
  providedIn: 'root'
})


export class QuestionOfflineService {
  protected _answer: Answer = null;
 

   @Input()
  set answer(answer: Answer) {
    this._answer = answer;
    this.loadSelected(answer);
  }

  get answer(): Answer {
    return this._answer;
  }

  isOnline: boolean;
  studentid: any;
  stationid: any;
  respuestasAguardar: Answer[];
  constructor(protected serverStatus: ServerStatusService,
              protected message: NzMessageService,
              protected translate: TranslateService
  )
               { }

    ngOnInit() {

      this.serverStatus.isAvailable.subscribe(value => {
        this.isOnline = value;

      if(value)
      {
        console.log('conexion en service', value);
        const key = `answers_${this.studentid}_${this.stationid}`;
      }
      });

    }

    GuardaRespuestaOffline(answer: Answer)
    {
      const studentid = answer.student?.id;
      const stationid = answer.station?.id;
      const key = `answers_${studentid}_${stationid}`;

       const respuestasGuardadas = JSON.parse(localStorage.getItem(key)) || [];
        const respuestasActualizadas = respuestasGuardadas.filter((a: any) => a.question.id !== answer.question.id);

        respuestasActualizadas.push(answer);
        localStorage.setItem(key, JSON.stringify(respuestasActualizadas));
        console.log('Answer saved to local storage:', respuestasActualizadas);
    }
   
    saveAnswer(answer: Answer): Promise<Answer> {
    return new Promise<Answer>((resolve, reject) => {    


      const studentid = answer.student?.id;
      const stationid = answer.station?.id;
      const key = `answers_${studentid}_${stationid}`;
        if(!this.isOnline)  
      {
           // Save answer to local storage
        
          if(studentid && stationid)
          {
              return this.GuardaRespuestaOffline(answer);
          }
      }
      else
      {
          // Save answer to server
        console.log('Guardando respuesta en el servidor', answer);
        this.GuardaRespuestaOffline(answer);
        const answer2 = localStorage.getItem(key); 
        const rawAnswers = JSON.parse(answer2) || [];
        const answers: Answer[] = rawAnswers.map(data => new Answer(data));
        answers.forEach(answer => {
        answer.save()
        .then(result => {
          console.log('Guardado con éxito:', result);
       })
    .catch(error => {
      console.error('Error al guardar:', error);
    });
      });  
    }
  });
  }
    
  loadSelected(answer: Answer) {
    if (answer) {
      // Logic to assign selected values
    }
  }

}

