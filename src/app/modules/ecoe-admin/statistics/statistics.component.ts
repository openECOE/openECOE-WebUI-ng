import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Area, EditCache, RowArea, ECOE} from '../../../models';
@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.less']
})
export class StatisticsComponent implements OnInit {
  editCache:    EditCache[] = [];
  ecoeId:       number;
  ecoe:         ECOE;
  ecoe_name:    String;
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
    });
    
      
    });
  }

  

  onBack() {
    this.router.navigate(['/ecoe/' + this.ecoeId + '/admin']).finally();
  }
}
