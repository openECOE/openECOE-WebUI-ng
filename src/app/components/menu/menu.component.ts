import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

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
  @Output() collapsedChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  onCollapsedChange($event: any) {
    this.collapsedChanged.emit(!!$event);
  }
}
