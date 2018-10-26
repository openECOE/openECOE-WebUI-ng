import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.less']
})
export class AdminComponent implements OnInit {

  isCollapsed: boolean = false;
  triggerTemplate = null;

  constructor() { }

  ngOnInit() {
  }

}
