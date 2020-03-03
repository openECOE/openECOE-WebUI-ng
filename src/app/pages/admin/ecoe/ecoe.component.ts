import {Component, OnInit, AfterViewInit} from '@angular/core';
import {ApiService} from '../../../services/api/api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ECOE} from '../../../models';
import {MenuService} from '../../../services/menu/menu.service';

@Component({
  selector: 'app-ecoe',
  templateUrl: './ecoe.component.html',
  styleUrls: ['./ecoe.component.less']
})
export class EcoeComponent implements OnInit, AfterViewInit {

  ecoe: any;
  isCollapsed: boolean = false;
  ecoeId: number;
  menu: any[];
  admin: boolean;

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              private menuService: MenuService
  ) {
    this.ecoeId = +this.route.snapshot.params.id;
  }

  ngOnInit() {

    this.menuService.getMenuFor(this.constructor.name)
      .then(value => {
        this.menu = value;
      });


    ECOE.fetch(this.ecoeId)
      .then(result => {
        this.ecoe = result;
      });
  }

  ngAfterViewInit() {
    this.menuService.currentMenu.next(this.constructor.name);
    this.menuService.menuAdmin.next(false);
  }

  collapsedChanged($event: boolean) {
    this.isCollapsed = $event;
  }
}
