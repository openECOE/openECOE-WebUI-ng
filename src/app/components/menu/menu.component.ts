import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.less']
})
export class MenuComponent implements OnInit {

  isCollapsed: boolean = false;
  isReverseArrow: boolean = false;

  @Input() menu_options: any[];
  @Input() admin: boolean;
  @Input() icons: any[];

  constructor() { }

  ngOnInit() {
    console.log('ngOnInit menu component');
  }

}
