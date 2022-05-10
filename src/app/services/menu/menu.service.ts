import { Injectable } from '@angular/core';
import {ResourceIcons} from '../../constants/icons';
import {BehaviorSubject} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {AuthenticationService} from '../authentication/authentication.service';
import {ApiService} from '../api/api.service';
import { ECOE } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  currentMenu: BehaviorSubject<string> = new BehaviorSubject(null);
  menuAdmin:   BehaviorSubject<boolean> = new BehaviorSubject(null);

  constructor(private authService: AuthenticationService,
              private apiService: ApiService) {
  }

  private readonly ECOE: Menu[] = [
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
      title: 'SCHEDULE',
      path: './schedule',
      icon: ResourceIcons.scheduleIcon,
      theme: 'outline'
    },
    {
      title: 'PLANNER',
      path: './planner',
      icon: ResourceIcons.plannerIcon
    },
    {
      title: 'STUDENTS',
      path: './students',
      icon: ResourceIcons.studentIcon,
      theme: 'outline'
    },
    {
      title: 'START_STOP_ECOE',
      path: './state',
      icon: ResourceIcons['play-square'],
      theme: 'outline'
    },
    {
      title: 'BACK',
      path: '/',
      icon: 'left-square'
    }
  ];

  getMenuFor(page: string): Promise<Array<any>> {
    return new Promise(async (resolve) => {
      switch (page) {
        case 'AdminComponent':
          resolve(await this.loadEcoes());
          break;
        case 'EcoeComponent':
          resolve(this.ECOE);
          break;
      }
    });
  }

  private async loadEcoes() {
    return ECOE.query<ECOE>()
  }
}

interface Menu {
  title: string;
  path: string;
  icon?: any;
  theme?: any;
  id?: any;
  addIcon?: any;
  name?: any;
}
