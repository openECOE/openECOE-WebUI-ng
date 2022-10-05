import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Area, EditCache, RowArea, ECOE} from '../../../models';
import {en_US, NzI18nService, NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder, zh_CN} from 'ng-zorro-antd';

class Puntuacion {
  idStudent?: number;
  name?: string;
  surnames?: string;
  dni?: string;
  points?: number;
  absoluteScore?: number;
  relativeScore?: number;

  sortOrder?: NzTableSortOrder;
  sortFn?: NzTableSortFn;
  sortDirections?: NzTableSortOrder[];
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.less']
})
export class StatisticsComponent implements OnInit {
  editCache:    EditCache[] = [];
  ecoeId:       number;
  ecoe:         ECOE;
  ecoe_name:    string;

  results:      Puntuacion[];
  totalItems:   number = 0;
  
  current_page: number = 1;
  per_page:     number = 10;
  
  
  constructor(
    private route: ActivatedRoute, 
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.ecoeId = +params.ecoeId;

      ECOE.fetch<ECOE>(this.ecoeId, {cache: false}).then(value => {
        this.ecoe = value;
        this.ecoe_name = this.ecoe.name;
  
        const excludeItems = [];

        this.ecoe.results()
          .then((response:Puntuacion[]) => {
            //this.results = response.sort((a, b) => a.idStudent - b.idStudent);
            this.results = response.sort((a, b) => b.points - a.points); 
            this.totalItems = response.length;
          });
      });
    });
  }

  /**
   * Fired on page changed, will change the data to display.
   */
   pageChange() {
    //TODO:: Esto habrá que adaptarlo cuando se ponga paginación en backend
    //this.loadAreas();
  }
  /**
   * When per page is changed this method will fired.
   * Will be reset the current page and loads again the areas
   * @param pageSize new value per page.
   */
   pageSizeChange(pageSize: number) {
    this.per_page = pageSize;
    //TODO:: Esto habrá que adaptarlo 
    this.resetCurrentPage();
    //this.loadAreas();
  }
  /**
   * Resets current page to first (1)
   */
   resetCurrentPage() { this.current_page = 1; }

  onBack() {
    this.router.navigate(['/ecoe/' + this.ecoeId + '/admin']).finally();
  }
  //Funciones para hacer sort a los datos
  sortId = (a: Puntuacion, b: Puntuacion) => b.idStudent - a.idStudent;
  sortDni = (a: Puntuacion, b: Puntuacion) => a.dni.localeCompare(b.dni);
  sortName = (a: Puntuacion, b: Puntuacion) => a.name.localeCompare(b.name);
  sortSurnames = (a: Puntuacion, b: Puntuacion) => a.surnames.localeCompare(b.surnames);
  sortPoints = (a: Puntuacion, b: Puntuacion) => b.points - a.points;
  sortAbsoluteScore = (a: Puntuacion, b: Puntuacion) => b.points/b.absoluteScore - a.points/a.absoluteScore;
  sortRelativeScore = (a: Puntuacion, b: Puntuacion) => b.points/b.relativeScore - a.points/a.relativeScore;
}
