import {Component, NgZone, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../../services/api/api.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.less']
})
export class AreasComponent implements OnInit {

  areas: any[];
  ecoeId: number;
  questions: any[];

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private ngZone: NgZone) {
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
    ).subscribe(response => this.areas = response);
  }

  loadQuestionsByArea(expandOpen: boolean, areaId: number) {
    if (expandOpen) {
      this.apiService.getResources('question', {
        where: `{"area":${areaId}}`,
        sort: '{"order":false}'
      }).subscribe(questions => {
        this.areas = this.areas.map(area => {
          if (area.id === areaId) {
            area.questionsArray = questions;
          }

          return area;
        });
      });
    }
  }

  deleteItem(ref: string) {
    this.apiService.deleteResource(ref)
      .subscribe(() => {
        this.areas = this.areas.filter(area => area['$uri'] !== ref);
      });
  }
}
