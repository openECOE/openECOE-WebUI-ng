import { Component, OnInit } from '@angular/core';
import {mergeMap} from 'rxjs/operators';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {AuthenticationService} from '../../../services/authentication/authentication.service';
import {ApiService} from '../../../services/api/api.service';
import { NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { ECOE, UserLogged} from '@app/models';
import { UserService } from '@app/services/user/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  showCreateEcoe: boolean;
  ecoes: ECOE[];
  ecoeForm: FormControl;
  organization: any;
  
  user: UserLogged;

  constructor(
    private formBuilder: FormBuilder,
    public userService: UserService,
    private auth: AuthenticationService,
    private apiService: ApiService,
    private modalSrv: NzModalService,
    private translate: TranslateService) {
               }

  ngOnInit() {
    this.ecoeForm = this.formBuilder.control('', Validators.required);

    this.userService.userDataChange.subscribe(user => {
      if (user) {
        this.user = this.userService.userData;
        this.loadEcoes()
      } else {
        this.auth.logout('/login');
      }
    })

    if (this.userService.userData) {
      this.user = this.userService.userData;
      this.loadEcoes()
    }
  }


  closeDrawer() {
    this.showCreateEcoe = false;
    this.ecoeForm.reset();
  }

  async loadEcoes() {
    this.ecoes = await ECOE.query()
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
      },
      error => {
        var msg = error.status == 409 ? this.translate.instant('ERROR_DUPLICATE_ECOE') : this.translate.instant('ERROR_REQUEST_CONTENT');
        this.modalSrv.error({
          nzMask: false,
          nzTitle: msg
        });
      });
  }
}
