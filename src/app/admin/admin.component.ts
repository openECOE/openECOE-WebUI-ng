import { Component, OnInit } from '@angular/core';
import {ApiService} from '../services/api/api.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.less']
})
export class AdminComponent implements OnInit {

  isCollapsed: boolean = false;
  ecoes: any[];

  showCreateEcoe: boolean;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.apiService.getResources('ecoe').subscribe(ecoes => this.ecoes = ecoes);
  }

  createEcoe() {

  }

  closeDrawer() {
    this.showCreateEcoe = false;
  }

}
