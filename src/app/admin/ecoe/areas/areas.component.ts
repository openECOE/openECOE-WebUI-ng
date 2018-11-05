import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../../services/api/api.service';
import {map} from 'rxjs/operators';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.less']
})
export class AreasComponent implements OnInit {

  areas: any[];
  ecoeId: number;
  questions: any[];
  editCache = {};

  constructor(private apiService: ApiService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;
    this.loadAreas();
  }

  loadAreas() {
    this.apiService.getResources('area', {
      where: `{"ecoe":${this.ecoeId}}`
    }).pipe(
      map(areas => {
        return areas.map(area => {
          return {questionsArray: [], ...area};
        });
      })
    ).subscribe(response => {
      this.areas = response;
      this.updateEditCache();
    });
  }

  loadQuestionsByArea(expandOpen: boolean, areaId: number) {
    if (expandOpen) {
      this.apiService.getResources('question', {
        where: `{"area":${areaId}}`,
        sort: '{"order":false}'
      }).pipe(
        map(questions => {
          return questions.map(question => {
            return {areaId, ...question};
          });
        })
      ).subscribe(questions => {
        this.areas = this.areas.map(area => {
          if (area.id === areaId) {
            area.questionsArray = questions;
          }

          return area;
        });

        this.updateEditCache();
      });
    }
  }

  deleteItem(ref: string, itemArray: any[]) {
    this.apiService.deleteResource(ref)
      .subscribe(() => itemArray = itemArray.filter(item => item['$uri'] !== ref));
  }

  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: number): void {
    this.editCache[id].edit = false;
  }

  saveEditArea(key: number): void {
    const area = this.editCache[key];
    const arrayObservables = [];

    const bodyArea = {
      name: area.name,
      code: area.code
    };
    arrayObservables.push(this.apiService.updateResource(area['$uri'], bodyArea));

    const questions = area.questionsArray;

    if (questions) {
      questions.forEach(question => {
        const body = {
          description: question.description,
          reference: question.reference,
          area: question.areaId
        };

        arrayObservables.push(this.apiService.updateResource(question['$uri'], body));
      });
    }

    forkJoin(arrayObservables).subscribe(() => {
      area.edit = false;
      this.loadAreas();
    });
  }

  updateEditCache(): void {
    this.areas.forEach(area => {
      this.editCache[area.id] = {
        edit: this.editCache[area.id] ? this.editCache[area.id].edit : false,
        ...area
      };
    });
  }
}
