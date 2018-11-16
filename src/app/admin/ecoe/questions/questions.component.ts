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
  editCache = {};
  ecoeId: number;
  qblockId: number;
  areas: any[] = [];
  qblocks: any[] = [];

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
      this.loadQuestions();
    });

    this.loadQblocks();
  }

  loadQuestions() {
    this.apiService.getResources('area', {
      where: `{"ecoe":${this.ecoeId}}`
    }).pipe(
      tap(areas => this.areas = areas),
      mergeMap(areas => {
        return <Observable<any[]>>zip(...areas.map(area => {
          return this.apiService.getResources('question', {
            where: (this.qblockId ? `{"area":${area.id},"qblocks":{"$contains":${this.qblockId}}}` : `{"area":${area.id}}`)
          })
            .pipe(map(questions => {
              return questions.map(question => {
                const refs = [];
                question.qblocks.forEach(qblock => refs.push(qblock['$ref']));
                return {areaId: area.id, areaName: area.name, qblocksRefs: refs, ...question};
              });
            }));
        }));
      }),
      map(questions => {
        return [].concat.apply([], questions);
      })
    ).subscribe(response => {
      this.editCache = {};
      this.questions = response;
      this.updateEditCache();
    });
  }

  loadQblocks() {
    this.apiService.getResources('station', {
      where: `{"ecoe":${this.ecoeId}}`
    }).pipe(
      mergeMap(stations => {
        return <Observable<any[]>>zip(...stations.map(station => {
          return this.apiService.getResources('qblock', {
            where: `{"station":${station.id}}`,
            sort: '{"order":false}'
          });
        }));
      }),
      map(questions => {
        return [].concat.apply([], questions);
      })
    ).subscribe(response => {
      this.qblocks = response;
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
    this.questions.forEach(item => {
      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        ...item
      };
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
