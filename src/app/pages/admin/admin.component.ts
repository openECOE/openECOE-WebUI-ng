import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../services/api/api.service';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import { ResourceIcons } from '../../constants/icons';
import {mergeMap} from 'rxjs/operators';
import {SharedService} from '../../services/shared/shared.service';
import {MenuService} from '../../services/menu/menu.service';
import {Router} from '@angular/router';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.less']
})
export class AdminComponent implements OnInit {

  isCollapsed: boolean = false;
  isReverseArrow: boolean = false;
  ecoes: any[];
  ecoeForm: FormControl;
  showCreateEcoe: boolean;
  organization: any;

  icons = ResourceIcons;

  menu: any[];
  admin: boolean;

  constructor(private apiService: ApiService,
              private formBuilder: FormBuilder,
              private authService: AuthenticationService,
              private sharedService: SharedService) {
  }

  ngOnInit() {
    this.ecoeForm = this.formBuilder.control('', Validators.required);
    this.loadEcoes();

    // this.menuService.menuAdmin.next(true);

    /*this.menuService.getMenuFor(this.constructor.name)
      .then(value => {
        this.menu = value;
        this.cdRef.markForCheck();
      });*/

    /*this.menuService.currentMenu.subscribe(value => {
      this.menuService.getMenuFor(value)
        .then(menu => { console.log('this.menuService.getMenuFor ', menu);
          this.menu = menu;
          this.cdRef.markForCheck();
        });
    });*/
    /*this.menuService.menuAdmin.subscribe( value => { console.log('admin?: ', value);
      this.admin = value;
      this.cdRef.markForCheck();
    });*/

  }

  loadEcoes() {
    this.authService.getUserData().pipe(
      mergeMap(userData => {
        this.organization = userData.organization;
        return this.apiService.getResources('ecoes', {
          where: `{"organization":{"$eq":${JSON.stringify(this.organization)}}}`
        });
      })
    ).subscribe(ecoes => {
      this.ecoes = ecoes;
      console.log('ecoes: ' , this.ecoes);
    });
  }

  submitForm() {
    const body = {
      name: this.ecoeForm.value,
      organization: this.organization
    };

    this.apiService.createResource('ecoes', body)
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

  minName(text: string): string {

    // First remove all letters, only use nums
    const minText = text.replace(/((?![\d\s]).)+/g, '').trim();

    return minText.length > 0 ? minText : text.charAt(0);
  }
}
