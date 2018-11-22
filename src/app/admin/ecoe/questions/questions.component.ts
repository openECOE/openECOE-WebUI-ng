import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {ApiService} from '../../../services/api/api.service';
import {forkJoin, Observable} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.less']
})
export class QuestionsComponent implements OnInit {

  stations: any[] = [];
  areas: any[] = [];
  qblocks: any[] = [];
  editCache = {};
  editCacheOption = {};
  ecoeId: number;
  qblockId: number;
  stationId: number;
  questionShowQblocks = {};

  index: number = 1;
  indexOpt: number = 1;

  question_type_options: Array<{type: string, label: string}> = [
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
    this.apiService.getResources('area', {
      where: `{"ecoe":${this.ecoeId}}`
    }).pipe(
      mergeMap(areas => {
        this.areas = areas;
        return this.apiService.getResources('station', {
          where: this.stationId ? `{"$uri":"/api/station/${this.stationId}"}` : `{"ecoe":${this.ecoeId}}`
        }).pipe(
          mergeMap(stations => {
            const requests = [];

            stations.forEach(station => {
              const request = this.apiService.getResources('qblock', {
                where: this.qblockId ? `{"$uri":"/api/qblock/${this.qblockId}"}` : `{"station":${station.id}}`
              }).pipe(
                mergeMap(qblocks => {
                  return <Observable<any[]>>forkJoin(...qblocks.map(qblock => {
                    return this.apiService.getResources('question', {
                      where: `{"qblocks":{"$contains":${qblock.id}}}`
                    }).pipe(map(questions => {
                      questions = questions.map(q => {
                        const area = areas.find(a => a['$uri'] === q.area['$ref']);
                        q.areaName = area.name;
                        q.areaId = area.id;
                        return q;
                      });

                      return [{...qblock, questions}];
                    }));
                  }));
                }),
                map(qblocks => {
                  return [{...station, qblocks: [].concat.apply([], qblocks)}];
                })
              );

              requests.push(request);
            });

            return forkJoin(requests);
          })
        );
      })
    ).subscribe(response => {
      this.editCache = {};
      this.stations = response[0];
      this.updateEditCache();
    });
  }

  loadOptionsByQuestion(expand: boolean, question: any) {
    if (expand) {
      this.apiService.getResources('option', {
        where: `{"question":${question.id}}`,
        sort: '{"order":false}'
      }).subscribe(options => {
        question.optionsArray = options;

        question.optionsArray.forEach(option => {
          this.editCacheOption[option.id] = {
            edit: this.editCacheOption[option.id] ? this.editCacheOption[option.id].edit : false,
            ...option
          };
        });
      });
    }
  }

  loadQblocksByStation(stationId: number) {
    this.apiService.getResources('qblock', {
      where: `{"station":${stationId}}`
    }).subscribe(qblocks => this.qblocks = qblocks);
  }

  startEdit(id: number) {
    this.editCache[id].edit = true;
  }

  saveItem(question: any, station: number, qblock: number, newItem: boolean) {
    const item = this.editCache[question.id];

    if (!item.description || !item.reference || !item.question_type || !item.areaId || !this.stations[station].qblocks[qblock].id) {
      return;
    }

    const body = {
      order: +item.order,
      description: item.description,
      reference: item.reference,
      question_type: item.question_type,
      area: item.areaId,
      qblocks: [this.stations[station].qblocks[qblock].id]
    };

    const request = (
      newItem ?
        this.apiService.createResource('question', body) :
        this.apiService.updateResource(item['$uri'], body)
    );

    request.pipe(
      map(response => {
        const area = this.areas.find(a => a.id === item.areaId);
        return {
          areaId: area.id,
          areaName: area.name,
          ...response
        };
      })
    ).subscribe(response => {
      delete this.editCache[question.id];
      delete this.editCache[response['id']];
      delete this.questionShowQblocks[question.id];
      delete this.questionShowQblocks[response['id']];

      this.editCache[response['id']] = {
        edit: false,
        areaId: question.areaId,
        ...response
      };

      this.questionShowQblocks[response['id']] = {
        show: false
      };

      this.stations[station].qblocks[qblock].questions =
        this.stations[station].qblocks[qblock].questions.map(x => (x.id === question.id ? response : x));
    });
  }

  cancelEdit(question: any, station: number, qblock: number) {
    this.editCache[question.id].edit = false;
    if (this.editCache[question.id].new_item) {
      this.updateArray(question.id, station, qblock);

    } else {
      this.editCache[question.id] = {
        ...question
      };
    }
  }

  deleteItem(question: any, station: number, qblock: number) {
    this.apiService.deleteResource(question['$uri']).subscribe(() => {
      this.updateArray(question.id, station, qblock);
    });
  }

  addQuestion(qblock) {
    this.apiService.getResources('question')
      .subscribe(questions => {
        this.index += questions.reduce((max, p) => p.id > max ? p.id : max, questions[0].id);

        const newItem = {
          id: this.index,
          order: '',
          description: '',
          reference: '',
          question_type: '',
          area: '',
          qblocks: [],
          options: []
        };

        qblock.questions = [...qblock.questions, newItem];

        this.editCache[this.index] = {
          edit: true,
          new_item: true,
          ...newItem
        };
      });
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

  updateArray(questionId: number, station: number, qblock: number) {
    delete this.editCache[questionId];
    delete this.questionShowQblocks[questionId];
    this.stations[station].qblocks[qblock].questions =
      this.stations[station].qblocks[qblock].questions.filter(x => x.id !== questionId);
  }

  moveQuestion(questionId: number, qblockPrevId: number, qblockNextId: number) {
    forkJoin(
      this.apiService.deleteResource(`/api/qblock/${qblockPrevId}/questions`, questionId),
      this.apiService.createResource(`qblock/${qblockNextId}/questions`, questionId)
    ).subscribe(() => {
      this.questionShowQblocks[questionId].show = false;
      this.loadQuestions();
    });
  }

  getQuestionTypeLabel(questionType: string) {
    return this.question_type_options.find(x => x.type === questionType).label;
  }

  startEditOption(id: number) {
    this.editCacheOption[id].edit = true;
  }

  saveOption(option: any, question: any, newItem: boolean) {
    const item = this.editCacheOption[option.id];

    if (!item.order || !item.label || !item.points) {
      return;
    }

    const body = {
      order: +item.order,
      label: item.label,
      points: +item.points,
      question: question.id
    };

    const request = (
      newItem ?
        this.apiService.createResource('option', body) :
        this.apiService.updateResource(item['$uri'], body)
    );

    request.subscribe(response => {
      delete this.editCacheOption[option.id];
      delete this.editCacheOption[response['id']];

      this.editCacheOption[response['id']] = {
        edit: false,
        ...response
      };

      question.optionsArray = question.optionsArray.map(x => (x.id === option.id ? response : x));
    });
  }

  cancelEditOption(option: any, question: any) {
    this.editCacheOption[option.id].edit = false;
    if (this.editCacheOption[option.id].new_item) {
      this.updateArrayOptions(option.id, question);

    } else {
      this.editCacheOption[option.id] = {
        ...option
      };
    }
  }

  deleteOption(option: any, question: any) {
    this.apiService.deleteResource(option['$uri']).subscribe(() => {
      this.updateArrayOptions(option.id, question);
    });
  }

  updateArrayOptions(option: number, question: any) {
    delete this.editCacheOption[option];
    question.optionsArray = question.optionsArray.filter(x => x.id !== option);
  }

  addOption(question: any) {
    this.apiService.getResources('option')
      .subscribe(options => {
        this.indexOpt += options.reduce((max, p) => p.id > max ? p.id : max, options[0].id);

        const newItem = {
          id: this.indexOpt,
          order: 0,
          label: '',
          points: 0,
          question: question.id
        };

        question.optionsArray = [...question.optionsArray, newItem];

        this.editCacheOption[this.indexOpt] = {
          edit: true,
          new_item: true,
          ...newItem
        };
      });
  }
}
