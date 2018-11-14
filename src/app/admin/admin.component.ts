import { Component, OnInit } from '@angular/core';
import {ApiService} from '../services/api/api.service';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {SharedService} from '../services/shared/shared.service';
import {ResourceIcons} from '../constants/icons';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.less']
})
export class AdminComponent implements OnInit {

  isCollapsed: boolean = false;
  ecoes: any[];
  ecoeForm: FormControl;
  showCreateEcoe: boolean;

  showAdminMenu: boolean;

  ecoe_menu: Array<{title: string, path: string, icon: string}> = [
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

  constructor(private apiService: ApiService,
              private formBuilder: FormBuilder,
              private sharedService: SharedService) {
  }

  ngOnInit() {
    this.ecoeForm = this.formBuilder.control('', Validators.required);

    this.loadEcoes();

    this.sharedService.getPageChanged()
      .subscribe(value => this.showAdminMenu = (value === '/admin'));
  }

  loadEcoes() {
    this.apiService.getResources('ecoe').subscribe(ecoes => this.ecoes = ecoes);
  }

  submitForm() {
    const body = {
      name: this.ecoeForm.value,
      organization: 1 // TODO: usar la organizacion del usuario
    };

    this.apiService.createResource('ecoe', body)
      .subscribe(result => {
        if (result) {
          this.loadEcoes();
          this.closeDrawer();
        }
      });
  }

  closeDrawer() {
    this.showCreateEcoe = false;
    this.ecoeForm.reset();
  }
}
