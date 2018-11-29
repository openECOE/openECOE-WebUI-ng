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

  areas: any[] = [];
  ecoeId: number;
  editCache = {};
  index: number = 1;

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

  deleteItem(area: any) {
    this.apiService.deleteResource(area['$uri']).subscribe(() => {
      this.updateArrayAreas(area.id);
    });
  }

  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(area: any): void {
    this.editCache[area.id].edit = false;

    if (this.editCache[area.id].new_item) {
      this.updateArrayAreas(area.id);
    } else {
      this.editCache[area.id] = area;
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

  saveItem(area: any, newItem: boolean): void {
    const item = this.editCache[area.id];

    if (!item.name || !item.code || !item.ecoe) {
      return;
    }

    const body = {
      name: item.name,
      code: item.code,
      ecoe: +item.ecoe
    };

    const request = (
      newItem ?
        this.apiService.createResource('area', body) :
        this.apiService.updateResource(item['$uri'], body)
    );

    request.subscribe(response => {
      delete this.editCache[area.id];
      delete this.editCache[response['id']];

      this.editCache[response['id']] = {
        edit: false,
        ...response
      };

      this.areas = this.areas.map(x => (x.id === area.id) ? response : x);
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

  addArea() {
    this.apiService.getResources('area')
      .subscribe(areas => {
        this.index += areas.reduce((max, p) => p.id > max ? p.id : max, areas[0].id);

        const newItem = {
          id: this.index,
          name: '',
          code: '',
          questions: [],
          ecoe: this.ecoeId
        };

        this.areas = [...this.areas, newItem];

        this.editCache[this.index] = {
          edit: true,
          new_item: true,
          ...newItem
        };
      });
  }

  updateArray(key: number, response: any) {
    delete this.editCache[key];
    this.editCache[response['id']] = {
      edit: false,
      ...response
    };

    this.areas = this.areas.map(a => (a.id === key ? response : a));
  }

  updateArrayAreas(areaId: number) {
    delete this.editCache[areaId];
    this.areas = this.areas.filter(x => x.id !== areaId);
  }
}
