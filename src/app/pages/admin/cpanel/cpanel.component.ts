import {Component, OnInit} from '@angular/core';
import {Item} from '@openecoe/potion-client';
import {ResourceIcons} from '../../../constants/icons';
import {SharedService} from '../../../services/shared/shared.service';

@Component({
  selector: 'app-cpanel',
  templateUrl: './cpanel.component.html',
  styleUrls: ['./cpanel.component.less']
})
export class CpanelComponent implements OnInit {

  loading: boolean = false;

  menu: Array<{ title: string, path: string, icon: string, theme?: string }> = [
    {
      title: 'CONTROL_PANEL',
      path: './',
      icon: ResourceIcons.infoIcon
    },
    {
      title: 'USERS',
      path: './users',
      icon: ResourceIcons.userIcon,
      theme: 'outline'
    },
    {
      title: 'BACK',
      path: '/admin',
      icon: 'left-square'
    }
  ];

  constructor(public shared: SharedService) {
  }

  ngOnInit() {
  }


}
