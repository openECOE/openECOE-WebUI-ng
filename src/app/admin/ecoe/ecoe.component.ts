import { Component, OnInit } from '@angular/core';
import {SharedService} from '../../services/shared/shared.service';
import {ResourceIcons} from '../../constants/icons';

@Component({
  selector: 'app-ecoe',
  templateUrl: './ecoe.component.html',
  styleUrls: ['./ecoe.component.less']
})
export class EcoeComponent implements OnInit {

  isCollapsed: boolean = false;

  ecoe_menu: Array<{title: string, path: string, icon: string}> = [
    {
      title: 'BACK',
      path: '/admin',
      icon: 'left-square'
    },
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
    //   title: 'CHRONOMETERS',
    //   path: '',
    //   icon: ResourceIcons.chronometerIcon
    // },
    // {
    //   title: 'SCHEDULE',
    //   path: '',
    //   icon: ResourceIcons.scheduleIcon
    // },
    {
      title: 'STUDENTS',
      path: './students',
      icon: ResourceIcons.studentIcon
    },
    {
      title: 'PLANNER',
      path: './planner',
      icon: ResourceIcons.plannerIcon
    }
  ];

  constructor(public sharedService: SharedService) {
  }

  ngOnInit() {

  }
}
