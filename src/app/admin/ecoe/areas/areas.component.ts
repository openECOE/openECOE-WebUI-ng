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
      this.editCache = {};
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

  deleteItem(ref: string) {
    this.apiService.deleteResource(ref)
      .subscribe(() => {
        this.areas = this.areas.filter(item => item['$uri'] !== ref);
        this.updateEditCache();
      });
  }

  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: number): void {
    const area = this.editCache[id];
    area.edit = false;

    if (area.new_area) {
      this.areas = this.areas.filter(a => a.id !== area.id);
    }
  }

  saveEditArea(key: number): void {
    const area = this.editCache[key];
    const arrayObservables = [];

    const bodyArea = {
      name: area.name,
      code: area.code,
      ecoe: area.ecoe
    };

    if (area.new_area) {
      this.areas = this.areas.filter(a => a.id !== area.id);
      arrayObservables.push(this.apiService.createResource('area', bodyArea));
    } else {
      arrayObservables.push(this.apiService.updateResource(area['$uri'], bodyArea));
    }

    const questions = area.questionsArray;

    if (questions && questions.length > 0) {
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

  addArea() {
    const index = this.areas.reduce((max, p) => p.id > max ? p.id : max, this.areas[0].id) + 1;
    const newArea = {
      id: index,
      name: '',
      code: '',
      questions: [],
      new_area: true,
      ecoe: this.ecoeId
    };

    this.areas = [...this.areas, newArea];

    this.editCache[index] = {
      edit: true,
      ...newArea
    };
  }
}
