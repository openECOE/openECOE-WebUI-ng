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
    }).subscribe(response => {
      this.editCache = {};
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

  deleteItem(ref: string) {
    const areaId = this.areas.find(a => a['$uri'] === ref).id;

    this.apiService.deleteResource(ref)
      .subscribe(() => {
        this.areas = this.areas.filter(item => item.id !== areaId);
        delete this.editCache[areaId];
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

  saveEditItem(key: number): void {
    const area = this.editCache[key];
    const arrayObservables = [];
    let questionsEdit = false;

    const bodyArea = {
      name: area.name,
      code: area.code
    };

    arrayObservables.push(this.apiService.updateResource(area['$uri'], bodyArea));

    const questions = area.questionsArray;

    if (questions && questions.length > 0) {
      questionsEdit = true;
      questions.forEach(question => {
        const body = {
          description: question.description,
          reference: question.reference,
          area: question.areaId
        };

        arrayObservables.push(this.apiService.updateResource(question['$uri'], body));
      });
    }

    forkJoin(arrayObservables).subscribe(res => {
      area.edit = false;
      if (!questionsEdit) {
        this.updateArray(key, res[0]);
      } else {
        this.loadAreas();
      }
    });
  }

  saveItem(key: number): void {
    const area = this.editCache[key];
    const body = {
      name: area.name,
      code: area.code,
      ecoe: area.ecoe
    };

    this.apiService.createResource('area', body)
      .pipe(
        map(res => {
          return {questionsArray: [], ...res};
        })
      ).subscribe(res => {
        this.updateArray(key, res);
    });
  }

  updateEditCache(): void {
    this.areas.forEach(item => {
      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        ...item
      };
    });
  }

  addItem() {
    const index = this.areas.reduce((max, p) => p.id > max ? p.id : max, this.areas[0].id) + 1;
    const newArea = {
      id: index,
      name: '',
      code: '',
      questions: [],
      ecoe: this.ecoeId
    };

    this.areas = [...this.areas, newArea];

    this.editCache[index] = {
      edit: true,
      new_area: true,
      ...newArea
    };
  }

  updateArray(key: number, response: any) {
    delete this.editCache[key];
    this.editCache[response['id']] = {
      edit: false,
      ...response
    };

    this.areas = [...this.areas.filter(a => a.id !== key), response];
  }
}
