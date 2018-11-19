import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {ApiService} from '../../../services/api/api.service';
import {Observable, zip} from 'rxjs';
import {map, mergeMap, tap} from 'rxjs/operators';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.less']
})
export class QuestionsComponent implements OnInit {

  questions: any[] = [];
  stations: any[] = [];
  editCache = {};
  ecoeId: number;
  qblockId: number;
  stationId: number;
  // qblocks: any[] = [];

  question_type_options: any[] = [
    {type: 'RB', label: 'ONE_ANSWER'},
    {type: 'CH', label: 'MULTI_ANSWER'},
    {type: 'RS', label: 'VALUE_RANGE'}
  ];

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;

    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.qblockId = +params.get('qblock');
      this.stationId = +params.get('station');
      this.loadQuestions();
    });
  }

  loadQuestions() {
    let request;

    if (this.stationId || this.qblockId) {
      request = this.apiService.getResources('qblock', {
        where: this.qblockId ? `{"$uri":"/api/qblock/${this.qblockId}"}` : `{"station":${this.stationId}}`
      }).pipe(
        mergeMap(qblocks => {
          return <Observable<any[]>>zip(...qblocks.map(qblock => {
            return this.apiService.getResources('question', {
              where: `{"qblocks":{"$contains":${qblock.id}}}`
            }).pipe(map(questions => [{id: qblock.id, name: qblock.name, questions}]));
          }));
        }),
        map(qblocks => {
          return [{id: this.stationId, qblocks: [].concat.apply([], qblocks)}];
        })
      );

    } else {
      request = this.apiService.getResources('station', {
        where: `{"ecoe":${this.ecoeId}}`
      }).pipe(
        mergeMap(stations => {
          return <Observable<any[]>>zip(...stations.map(station => {
            return this.apiService.getResources('qblock', {
              where: `{"station":${station.id}}`
            }).pipe(
              mergeMap(qblocks => {
                return <Observable<any[]>>zip(...qblocks.map(qblock => {
                  return this.apiService.getResources('question', {
                    where: `{"qblocks":{"$contains":${qblock.id}}}`
                  }).pipe(map(questions => [{id: qblock.id, name: qblock.name, questions}]));
                }));
              })
            );
          }));
        }),
        tap(res => console.log(res)),
        map(questions => {
          return [].concat.apply([], questions);
        })
      );
    }

    request.subscribe(response => {
      console.log(response)
      this.editCache = {};
      this.stations = response;
      this.questions = response;
      this.updateEditCache();
    });
  }

  loadOptionsByQuestion(expand: boolean, questionId: number) {
    if (expand) {
      this.apiService.getResources('option', {
        where: `{"question":${questionId}}`,
        sort: '{"order":false}'
      }).pipe(
        map(options => {
          return options.map(option => {
            return {questionId, ...option};
          });
        })
      ).subscribe(options => {
        this.questions = this.questions.map(question => {
          if (question.id === questionId) {
            question.optionsArray = options;
          }

          return question;
        });

        this.updateEditCache();
      });
    }
  }

  startEdit(id: number) {

  }

  saveItem(id: number) {
    const item = this.editCache[id];
    const body = {
      order: item.order,
      description: item.description,
      reference: item.reference,
      question_type: item.question_type,
      area: item.area,
      qblocks: item.qblocks
    };

    this.apiService.createResource('question', body)
      .subscribe(res => {
        this.updateArray(id, res);
      });
  }

  saveEditItem(id: number) {

  }

  cancelEdit(id: number) {

  }

  deleteItem(ref: string) {

  }

  addItem() {
    const index = this.questions.reduce((max, p) => p.id > max ? p.id : max, this.questions[0].id) + 1;
    const newItem = {
      id: index,
      order: '',
      description: '',
      reference: '',
      question_type: '',
      area: '',
      qblocks: [],
      options: []
    };

    this.questions = [...this.questions, newItem];

    this.editCache[index] = {
      edit: true,
      new_item: true,
      ...newItem
    };
  }

  updateEditCache(): void {
    this.stations.forEach(st => {
      st.qblocks.forEach(qb => {
        qb.questions.forEach(item => {
          this.editCache[item.id] = {
            edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
            ...item
          };
        });
      });
    });
  }

  deleteFilter() {
    this.router.navigate(['../questions'], {
      relativeTo: this.route,
      replaceUrl: true
    });
  }

  updateArray(id: number, response: any) {
    delete this.editCache[id];
    this.editCache[response['id']] = {
      edit: false,
      ...response
    };

    this.questions = this.questions.map(a => (a.id === id ? response : a));
  }
}
