import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {ApiService} from '../../../services/api/api.service';
import {forkJoin, Observable, zip} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.less']
})
export class QuestionsComponent implements OnInit {

  questions: any[] = [];
  stations: any[] = [];
  qblocks: any[] = [];
  editCache = {};
  ecoeId: number;
  qblockId: number;
  stationId: number;
  questionShowQblocks = {};

  question_type_options: any[] = [
    {type: 'RB', label: 'ONE_ANSWER'},
    {type: 'CH', label: 'MULTI_ANSWER'},
    {type: 'RS', label: 'VALUE_RANGE'}
  ];

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;

    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.qblockId = +params.get('qblock');
      this.stationId = +params.get('station');
      this.loadQuestions();
    });
  }

  loadQuestions() {
    this.apiService.getResources('station', {
      where: this.stationId ? `{"$uri":"/api/station/${this.stationId}"}` : `{"ecoe":${this.ecoeId}}`
    })
      .subscribe(stations => {
        const requests = [];

        stations.forEach(station => {
          const request = this.apiService.getResources('qblock', {
            where: this.qblockId ? `{"$uri":"/api/qblock/${this.qblockId}"}` : `{"station":${station.id}}`
          }).pipe(
            mergeMap(qblocks => {
              return <Observable<any[]>>zip(...qblocks.map(qblock => {
                return this.apiService.getResources('question', {
                  where: `{"qblocks":{"$contains":${qblock.id}}}`
                }).pipe(map(questions => [{...qblock, questions}]));
              }));
            }),
            map(qblocks => {
              return [{...station, qblocks: [].concat.apply([], qblocks)}];
            })
          );

          requests.push(request);
        });

        forkJoin(requests)
          .subscribe(response => {
            this.editCache = {};
            this.stations = response[0];
            this.questions = response[0];
            this.updateEditCache();
          });
      });
  }

  loadOptionsByQuestion(expand: boolean, question: any) {
    if (expand) {
      this.apiService.getResources('option', {
        where: `{"question":${question.id}}`,
        sort: '{"order":false}'
      }).pipe(
        map(options => {
          return options.map(option => {
            return {questionId: question.id, ...option};
          });
        })
      ).subscribe(options => {
        question.optionsArray = options;
        this.updateEditCache();
      });
    }
  }

  loadQblocksByStation(stationId: number) {
    this.apiService.getResources('qblock', {
      where: `{"station":${stationId}}`
    }).subscribe(qblocks => this.qblocks = qblocks);
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
    this.apiService.deleteResource(ref).subscribe(() => this.loadQuestions());
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
          this.questionShowQblocks[item.id] = {
            show: false
          };
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
      replaceUrl: true,
      queryParams: {station: this.stationId}
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

  moveQuestion(questionId, qblockPrevId, qblockNextId) {
    forkJoin(
      this.apiService.deleteResource(`/api/qblock/${qblockPrevId}/questions`, questionId),
      this.apiService.createResource(`qblock/${qblockNextId}/questions`, questionId)
    ).subscribe(() => {
      this.questionShowQblocks[questionId].show = false;
      this.loadQuestions();
    });
  }
}
