import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {ApiService} from '../../../services/api/api.service';
import {forkJoin, Observable} from 'rxjs';
import {map, mergeMap, tap} from 'rxjs/operators';
import {SharedService} from '../../../services/shared/shared.service';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.less']
})
export class QuestionsComponent implements OnInit {

  stations: any[] = [];
  stationSelected: any;
  areas: any[] = [];
  qblocks: any[] = [];
  editCache = {};
  editCacheOption = {};
  ecoeId: number;
  qblockId: number;
  stationId: number;
  questionShowQblocks = {};
  valueopt: number;

  index: number = 1;
  indexOpt: number = 1;

  question_type_options: Array<{ type: string, label: string }> = [
    {type: 'RB', label: 'ONE_ANSWER'},
    {type: 'CH', label: 'MULTI_ANSWER'},
    {type: 'RS', label: 'VALUE_RANGE'}
  ];

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              private sharedService: SharedService) {
  }

  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;

    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.qblockId = params.get('qblock') ? +params.get('qblock') : null;
      this.stationId = params.get('station') ? +params.get('station') : null;
      this.loadQuestions();
    });
  }

  loadQuestions() {
    this.stationSelected = {};
    this.apiService.getResources('area', {
      where: `{"ecoe":${this.ecoeId}}`
    }).pipe(
      mergeMap(areas => {
        this.areas = areas;
        return this.apiService.getResources('station', {
          where: `{"ecoe":${this.ecoeId}}`
        }).pipe(
          tap(stations => this.stations = stations),
          mergeMap(stations => {
            const station = this.stationId ? stations.find(st => st.id === this.stationId) : stations[0];
            return this.apiService.getResources('qblock', {
              where: (this.stationId && this.qblockId) ? `{"$uri":"/api/qblock/${this.qblockId}"}` : `{"station":${station.id}}`
            }).pipe(
              mergeMap(qblocks => {
                this.stationId = station.id;
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

                    qblock.show = true;
                    return [{...qblock, questions}];
                  }));
                }));
              }),
              map(qblocks => {
                return [{...station, qblocks: [].concat.apply([], qblocks)}];
              })
            );
          })
        );
      })
    ).subscribe(response => {
      this.stationSelected = response[0];
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

  saveItem(question: any, qblock: any, newItem: boolean) {
    const item = this.editCache[question.id];

    if (!item.description || !item.reference || !item.question_type || !item.areaId || !qblock.id) {
      return;
    }

    const body = {
      order: +item.order,
      description: item.description,
      reference: item.reference,
      question_type: item.question_type,
      area: item.areaId,
      qblocks: [qblock.id]
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
          optionsArray: question.optionsArray,
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

      qblock.questions = qblock.questions.map(x => (x.id === question.id) ? response : x);
    });
  }

  cancelEdit(question: any, qblock: any) {
    this.editCache[question.id].edit = false;

    if (this.editCache[question.id].new_item) {
      this.updateArrayQuestions(question.id, qblock);
    } else {
      this.editCache[question.id] = question;
    }
  }

  deleteItem(question: any, qblock: any) {
    this.apiService.deleteResource(question['$uri']).subscribe(() => {
      this.updateArrayQuestions(question.id, qblock);
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
    this.editCache = {};
    this.stationSelected.qblocks.forEach(qb => {
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
  }

  updateArrayQuestions(questionId: number, qblock: any) {
    delete this.editCache[questionId];
    delete this.questionShowQblocks[questionId];
    qblock.questions = qblock.questions.filter(x => x.id !== questionId);
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

      question.optionsArray = question.optionsArray
        .map(x => (x.id === option.id ? response : x))
        .sort(this.sharedService.sortArray);
    });
  }

  cancelEditOption(option: any, question: any) {
    this.editCacheOption[option.id].edit = false;
    if (this.editCacheOption[option.id].new_item) {
      this.updateArrayOptions(option.id, question);

    } else {
      this.editCacheOption[option.id] = option;
    }
  }

  deleteOption(option: any, question: any) {
    this.apiService.deleteResource(option['$uri']).subscribe(() => {
      this.updateArrayOptions(option.id, question);
    });
  }

  updateArrayOptions(option: number, question: any) {
    delete this.editCacheOption[option];
    question.optionsArray = question.optionsArray
      .filter(x => x.id !== option)
      .sort(this.sharedService.sortArray);
  }

  addOption(question: any) {
    this.apiService.getResources('option')
      .subscribe(options => {
        this.indexOpt += options.reduce((max, p) => p.id > max ? p.id : max, options[0].id);

        const newItem = {
          id: this.indexOpt,
          order: '',
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

  changeOptionOrder(direction: string, option: any, index: number, question: any) {
    let itemToMove;

    if (direction === 'up') {
      itemToMove = question.optionsArray[index - 1];
    } else {
      itemToMove = question.optionsArray[index + 1];
    }

    forkJoin(
      this.apiService.updateResource(option['$uri'], {order: itemToMove.order}),
      this.apiService.updateResource(itemToMove['$uri'], {order: option.order})
    ).subscribe(response => {
      response.forEach(res => {
        this.editCacheOption[res['id']] = res;

        question.optionsArray = question.optionsArray
          .map(x => (x.id === res.id ? res : x))
          .sort(this.sharedService.sortArray);
      });
    });
  }

  deleteFilter(station: number) {
    this.router.navigate(['../questions'], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {station: station}
    });
  }
}
