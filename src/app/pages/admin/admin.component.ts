import { Component, OnInit } from '@angular/core';
import {ApiService} from '../../services/api/api.service';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {SharedService} from '../../services/shared/shared.service';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import {mergeMap} from 'rxjs/operators';

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
  organization: any;

  constructor(private apiService: ApiService,
              private formBuilder: FormBuilder,
              public sharedService: SharedService,
              private authService: AuthenticationService) {
  }

  ngOnInit() {
    this.ecoeForm = this.formBuilder.control('', Validators.required);
    this.loadEcoes();
  }

  loadEcoes() {
    this.authService.getUserData().pipe(
      mergeMap(userData => {
        this.organization = userData.organization;
        return this.apiService.getResources('ecoe', {
          where: `{"organization":{"$eq":${JSON.stringify(this.organization)}}}`
        });
      })
    ).subscribe(ecoes => this.ecoes = ecoes);
  }

  submitForm() {
    const body = {
      name: this.ecoeForm.value,
      organization: this.organization
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
