import {Component, OnInit, AfterViewInit} from '@angular/core';
import {SharedService} from '../../../services/shared/shared.service';
import {ResourceIcons} from '../../../constants/icons';
import {ApiService} from '../../../services/api/api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ECOE} from '../../../models/ecoe';
import {MenuService} from '../../../services/menu/menu.service';

@Component({
  selector: 'app-ecoe',
  templateUrl: './ecoe.component.html',
  styleUrls: ['./ecoe.component.less']
})
export class EcoeComponent implements OnInit, AfterViewInit {

  ecoe: any;
  isCollapsed: boolean = false;
  isReverseArrow: boolean = false;

  ecoeId: number;

  menu: any[];
  admin: boolean;

  constructor(public sharedService: SharedService,
              private apiService: ApiService,
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
      .then(ecoe => {
        this.ecoe = ecoe;
        // this.ecoe_menu[0].title = this.ecoe.name;
      });
  }

  ngAfterViewInit() { console.log('from ECOE component do next');
    this.menuService.currentMenu.next(this.constructor.name);
    this.menuService.menuAdmin.next(false);
  }
}
