import { Component, OnInit } from "@angular/core";
import { debounceTime } from "rxjs/operators";
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { ApiService } from "../../../services/api/api.service";
import { NzModalService } from "ng-zorro-antd";
import { TranslateService } from "@ngx-translate/core";
import { UserLogged } from "@app/models";
import { ECOE } from "../../../models";
import { UserService } from "@app/services/user/user.service";

import { Router } from "@angular/router";
import { Observable, Observer } from "rxjs";
import { SharedService } from "@app/services/shared/shared.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.less"],
})
export class HomeComponent implements OnInit {
  showCreateEcoe: boolean;
  ecoesList: ECOE[];
  ecoeForm: FormControl;
  ecoesDelist: ECOE[];
  ecoe: ECOE;
  organization: any;

  user: UserLogged;
  Listed: any;
  Delisted: any;

  validateForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public userService: UserService,
    private apiService: ApiService,
    private modalSrv: NzModalService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private shared: SharedService
  ) {
    this.validateForm = this.fb.group({
      ecoeName: ['', [Validators.required], [this.userNameAsyncValidator]],
    });
  }

  ngOnInit() {
    this.Listed = true;
    this.Delisted = false;
    this.ecoeForm = this.formBuilder.control("", Validators.required);
    this.loadEcoes();
  }

  closeDrawer() {
    this.showCreateEcoe = false;
    this.ecoeForm.reset();
  }

  async loadEcoes() {
    ECOE.query<ECOE>().then((_ecoes) => {
      this.ecoesList = _ecoes;
    });
  }

  showListed() {
    this.Listed = true;
    this.Delisted = false;
  }

  showDelisted() {
    this.Listed = false;
    this.Delisted = true;
    //Llamamos a ECOE(la clase), no a ecoe(instancia de la clase)
    ECOE.archive(
      {
        page: 1,
        perPage: 50,
        sort: { $uri: false },
      },
      { paginate: true, cache: false }
    ).then((delisted) => {
      this.ecoesDelist = delisted.toArray();
    });
  }
  restoreEcoe(id: string) {
    const body = {
      restore: "restore",
    };
    const resource = "ecoes/archive/" + id + "/restore";
    this.apiService.createResource(resource, body).subscribe((result) => {
      if (result) {
        ECOE.dearchive();
        window.location.reload();
      }
    });
  }

  userNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      setTimeout(async () => {
        const _ecoe = await ECOE.first({where: {name: control.value, organization: this.organization}})
        const _ecoeArchived = await ECOE.archive({where: {name: control.value, organization: this.organization}})

        if (_ecoe || _ecoeArchived.length > 0) {
          // you have to return `{error: true}` to mark it as an error event
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      }, 1000);
    });

  async submitFormECOE(form: FormGroup) { 

    this.shared.doFormDirty(this.validateForm)
    if (form.pending) {
      const sub = form.statusChanges.subscribe(() => {
        if (form.valid) {
          this.submitForm(form.value);
        }
        sub.unsubscribe();
      });
    } else if (form.valid) {
      this.submitForm(form.value);
    }
  }

  async submitForm(value: any) {
    const _ecoe = new ECOE();
    _ecoe.name = value.ecoeName;
    _ecoe.organization = this.organization;
    
    try {
      const newEcoe = await _ecoe.save();
      this.ecoesList.push(newEcoe);

      this.modalSrv.success({
        nzMask: false,
        nzTitle: this.translate.instant("ECOE_CREATED", { name: newEcoe.name }),
      });
      this.closeDrawer();
    } catch (error) {
      console.log(error);
      var msg =
          error.status == 409
            ? this.translate.instant("ERROR_DUPLICATE_ECOE")
            : this.translate.instant("ERROR_REQUEST_CONTENT");
        this.modalSrv.error({
          nzMask: false,
          nzTitle: msg,
        });
    }
  }
}
