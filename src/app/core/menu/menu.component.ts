import { Component, OnInit, Input, Output } from '@angular/core';
import { Location } from '@angular/common';
import { EventEmitter } from '@angular/core';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.less']
})
export class MenuComponent implements OnInit {


  @Output() menu_close_event = new EventEmitter<Boolean>();

  constructor(public location: Location) { }

  ngOnInit() {
  }

  toclose(){
    this.menu_close_event.emit(true);
  }

}
