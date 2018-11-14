import { Component, OnInit } from '@angular/core';
import {ResourceIcons} from '../../constants/icons';

@Component({
  selector: 'app-ecoe',
  templateUrl: './ecoe.component.html',
  styleUrls: ['./ecoe.component.less']
})
export class EcoeComponent implements OnInit {

  isCollapsed: boolean = false;

  items_menu: Array<{title: string, path: string, icon: string}> = [
    {
      title: 'INFORMATION',
      path: './',
      icon: ResourceIcons.infoIcon
    },
    {
      title: 'AREAS',
      path: './areas',
      icon: ResourceIcons.areaIcon
    },
    {
      title: 'STATIONS',
      path: './stations',
      icon: ResourceIcons.stationIcon
    },
    {
      title: 'QUESTIONS',
      path: './questions',
      icon: ResourceIcons.questionIcon
    },
    // {
    //   title: 'QBLOCKS',
    //   path: './qblocks',
    //   icon: ''
    // },
    {
      title: 'CHRONOMETERS',
      path: '',
      icon: ''
    },
    {
      title: 'STUDENTS',
      path: '',
      icon: ResourceIcons.studentIcon
    },
    {
      title: 'GROUPS',
      path: '',
      icon: ResourceIcons.groupIcon
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
