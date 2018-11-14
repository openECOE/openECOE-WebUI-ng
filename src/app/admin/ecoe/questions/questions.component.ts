import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {ApiService} from '../../../services/api/api.service';
import {Observable, zip} from 'rxjs';
import {map, mergeMap, switchMap} from 'rxjs/operators';

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

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;

    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.qblockId = +params.get('qblock');
      this.loadQuestions();
    });
  }

  loadQuestions() {
    this.apiService.getResources('area', {
      where: `{"ecoe":${this.ecoeId}}`
    }).pipe(
      mergeMap(areas => {
        return <Observable<any[]>>zip(...areas.map(area => {
          return this.apiService.getResources('question', {
            where: (this.qblockId ? `{"area":${area.id},"qblocks":{"$contains":${this.qblockId}}}` : `{"area":${area.id}}`)
          });
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

  }

  saveEditItem(id: number) {

  }

  cancelEdit(id: number) {

  }

  deleteItem(ref: string) {

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
}
