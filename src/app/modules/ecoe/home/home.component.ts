import { Component, OnInit } from '@angular/core';
import {mergeMap} from 'rxjs/operators';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {AuthenticationService} from '../../../services/authentication/authentication.service';
import {ApiService} from '../../../services/api/api.service';
import { NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { ECOE, UserLogged } from '@app/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  showCreateEcoe: boolean;
  ecoes: any[];
  ecoeForm: FormControl;
  organization: any;

  constructor(
    private formBuilder: FormBuilder,
    public authService: AuthenticationService,
    private apiService: ApiService,
    private modalSrv: NzModalService,
    private translate: TranslateService) {
               }

  ngOnInit() {
    this.ecoeForm = this.formBuilder.control('', Validators.required);

    if (this.authService.userLogged) {
      this.loadEcoes()
    } else {
      this.authService.logout('/login');
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
