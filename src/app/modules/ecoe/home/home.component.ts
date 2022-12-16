import { Component, OnInit } from "@angular/core";
import { mergeMap } from "rxjs/operators";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { AuthenticationService } from "../../../services/authentication/authentication.service";
import { ApiService } from "../../../services/api/api.service";
import { NzModalService } from "ng-zorro-antd";
import { TranslateService } from "@ngx-translate/core";
import { UserLogged } from "@app/models";
import { ECOE } from "../../../models";
import { UserService } from "@app/services/user/user.service";

import { Router, ActivatedRoute } from "@angular/router";

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

  constructor(
    private formBuilder: FormBuilder,
    public userService: UserService,
    private apiService: ApiService,
    private modalSrv: NzModalService,
    private translate: TranslateService,
    private router: Router
  ) {}

  ngOnInit() {
    this.Listed = true;
    this.Delisted = false;
    this.ecoeForm = this.formBuilder.control("", Validators.required);
    this.loadEcoes();

    // this.userService.userDataChange.subscribe(user => {
    //   if (user) {
    //     this.user = this.userService.userData;
    //     this.loadEcoes()
    //   } else {
    //     this.auth.logout('/login');
    //   }
    // })

    // if (this.userService.userData) {
    //   this.user = this.userService.userData;
    //   this.loadEcoes()
    // }
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
    /*new ECOE(this.ecoe)
      .dearchive()
      .then((result) => {
        this.router.navigate(["/ecoe"]);
      })
      .catch((error) => {
        this.message.error(this.translate.instant("ERROR_REQUEST_CONTENT"), {
          nzDuration: 5000,
        });
      });*/
  }
  submitForm() {
    const body = {
      name: this.ecoeForm.value,
      organization: this.organization,
    };

    this.apiService.createResource("ecoes", body).subscribe(
      (result) => {
        if (result) {
          this.loadEcoes();
          this.closeDrawer();
        }
      },
      (error) => {
        var msg =
          error.status == 409
            ? this.translate.instant("ERROR_DUPLICATE_ECOE")
            : this.translate.instant("ERROR_REQUEST_CONTENT");
        this.modalSrv.error({
          nzMask: false,
          nzTitle: msg,
        });
      }
    );
  }
}
