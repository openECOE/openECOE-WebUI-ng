import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../../../services/api/api.service';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.less']
})
export class AreasComponent implements OnInit {

  areas: any[];
  ecoeId: number;

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;
    this.loadAreas();
  }

  loadAreas() {
    this.apiService.getResources('area', {
      where: `{"ecoe":${this.ecoeId}}`
    }).subscribe(response => this.areas = response);
  }

  loadQuestionsByArea(areaId: number) {
    return this.apiService.getResources('question', {
      where: `{"area":${areaId}}`,
      sort: '{"order":false}'
    }).pipe(take(1));
    // this.router.navigate(['./questions'], {queryParams: {area: areaId}});
  }

  deleteItem(ref: string) {
    this.apiService.deleteResource(ref);
  }
}
