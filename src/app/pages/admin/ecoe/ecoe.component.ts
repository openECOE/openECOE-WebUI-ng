import {Component, OnInit} from '@angular/core';
import {SharedService} from '../../../services/shared/shared.service';
import {ResourceIcons} from '../../../constants/icons';
import {ApiService} from '../../../services/api/api.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-ecoe',
  templateUrl: './ecoe.component.html',
  styleUrls: ['./ecoe.component.less']
})
export class EcoeComponent implements OnInit {

  ecoe: any;
  isCollapsed: boolean = false;

  ecoe_menu: Array<{title: string, path: string, icon: string, theme?: string}> = [
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
    {
      title: 'STUDENTS',
      path: './students',
      icon: ResourceIcons.studentIcon,
      theme: 'outline'
    },
    {
      title: 'PLANNER',
      path: './planner',
      icon: ResourceIcons.plannerIcon
    },
    {
      title: 'BACK',
      path: '/admin',
      icon: 'left-square'
    }
    // {
    //   title: 'CHRONOMETERS',
    //   path: '',
    //   icon: ResourceIcons.chronometerIcon
    // },
    // {
    //   title: 'SCHEDULE',
    //   path: '',
    //   icon: ResourceIcons.scheduleIcon
    // }
  ];

  constructor(public sharedService: SharedService,
              private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router
  ) {
    const ecoeId = +this.route.snapshot.params.id;
    this.apiService.getResource(`/api/ecoe/${ecoeId}`).subscribe(ecoe => {
      this.ecoe = [ecoe];
      this.ecoe_menu[0].title = this.ecoe[0].name;
    });
  }

  ngOnInit() {

  }
}
