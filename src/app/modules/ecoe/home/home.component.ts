import { Component, OnDestroy, OnInit } from "@angular/core";
import { takeUntil} from "rxjs/operators";
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { ApiService } from "../../../services/api/api.service";
import { NzModalService } from "ng-zorro-antd/modal";
import { TranslateService } from "@ngx-translate/core";
import { Organization, UserLogged } from "@app/models";
import { ECOE } from "../../../models";
import { UserService } from "@app/services/user/user.service";
import { Observable, Observer, ReplaySubject} from "rxjs";
import { SharedService } from "@app/services/shared/shared.service";
import { ActionMessagesService } from "@app/services/action-messages/action-messages.service";
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.less"],
})
export class HomeComponent implements OnInit, OnDestroy {
  showCreateEcoe: boolean;
  showEditEcoe: boolean;
  ecoesList: ECOE[];
  ecoeForm: FormControl;
  ecoesDelist: ECOE[];
  ecoe: ECOE;
  organization: Organization;

  isVisible: any;
  ecoeName: string;
  ecoeNameJSON: string;
  fileContent: any;

  user: UserLogged;
  Listed: any;
  Delisted: any;

  validateForm!: FormGroup;
  validateFormJSON!: FormGroup;

  // Form ECOE name
  show_ecoe_name_drawer: Boolean = false;
  ecoe_name_form_loading: Boolean = false;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private formBuilder: FormBuilder,
    public userService: UserService,
    private apiService: ApiService,
    private modalSrv: NzModalService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private shared: SharedService,
    private message: ActionMessagesService
  ) {
    this.validateForm = this.fb.group({
      ecoeName: ['', [Validators.required], [this.userNameAsyncValidator]],
    });

    this.validateFormJSON = this.fb.group({
      ecoeNameJSON: ['', [Validators.required], [this.userNameAsyncValidator]],
    });
  }
  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }


  ngOnInit() {
    this.Listed = true;
    this.Delisted = false;
    this.ecoeForm = this.formBuilder.control("", Validators.required);

    if (this.userService.userData) {
      // Cuando le das a la flecha para atrás
      // se seguiran viendo las ecoes
      this.user = this.userService.userData;
      this.organization = this.user.user.organization;
      this.loadEcoes();
    } else {
      this.userService.userDataChange.pipe(takeUntil(this.destroyed$)).subscribe((user) => {
        this.user = user;
        this.organization = this.user.user.organization;
        this.loadEcoes();
      });
    }
  }

  async loadEcoes(): Promise<void> {
    const query = {
      where: {organization: this.user.user.organization},
      sort: {$uri: false},
      perPage: 100
    }

    this.ecoesList = (await ECOE.query(query, {
      paginate: false,
      cache: false, skip:['jobReports','jobCsv','organization','stages','stations','schedules','students','rounds','shifts','evaluators']
    })) as ECOE[];

  }

  closeDrawer() {
    this.showCreateEcoe = false;
    this.showEditEcoe = false;
    this.ecoeForm.reset();
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
    this.apiService.createResource(resource, body).
      pipe(takeUntil(this.destroyed$))
      .subscribe((result) => {
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

    this.shared.doFormDirty(this.validateForm || this.validateFormJSON);
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

  exportECOE(ecoe: ECOE) {
    this.apiService
      .getResourceFile("ecoes/" + ecoe.id + "/export")
      .subscribe((results) => {
        const parsedJson = JSON.parse(new TextDecoder().decode(results as ArrayBuffer));
        const jsonFile = new Blob([JSON.stringify(parsedJson, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(jsonFile);

        const link = document.createElement('a');
        link.href = url;
        link.download = ecoe.name + '.ecoe';

        document.body.appendChild(link);

        link.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          })
        );

        document.body.removeChild(link);
      });
  }

  cloneECOE(ecoe: ECOE) {
    this.apiService.cloneEcoe(ecoe)
      .toPromise().then(() => {
        this.loadEcoes();
        this.message.createSuccessMsg(this.translate.instant("ECOE_CLONED_SUCCESS"));
      }).catch((err) => {
        this.message.createErrorMsg(err.error.message);
      });
  }

  handleUpload = (file: any) => {
    const fr = new FileReader();
    fr.onload = (e) => {
      file.onSuccess({}, file.file, 'success');
      this.fileContent = fr.result.toString();
      this.isVisible = true;
    };
    fr.readAsText(file.file);
    this.closeDrawer();
  }

  handleFile(fileString: string) {
    // Verificar si el archivo es JSON
    try{
      const jsonObject = JSON.parse(fileString);
      if (jsonObject.areas) {
        return [jsonObject];
      }else
        this.message.createErrorMsg(this.translate.instant("CORRUPTED_JSON_FILE"));
    }catch(e){
      this.message.createErrorMsg(this.translate.instant("CORRUPTED_JSON_FILE"));
    }
  }

  handleOk(): void {
    this.isVisible = false;
    const ecoe = this.handleFile(this.fileContent);
    if (ecoe) {
      this.importECOE(ecoe);
    }
    this.ecoeNameJSON = "";
  }

  handleCancel(): void {
    this.isVisible = false;
    this.fileContent = null;
    this.ecoeNameJSON = "";
  }

  importECOE(ecoe:any): void {
    this.apiService.importEcoeJSON(ecoe[0], this.ecoeNameJSON).toPromise()
      .then(() => {
        this.message.createSuccessMsg(this.translate.instant("ECOE_IMPORTED_SUCCESS"));
        this.loadEcoes().finally()
      })
      .catch(err =>
        {
          if (err.status === 500) {
            this.message.createErrorMsg(err.error.message);
          } else {
            this.message.createErrorMsg(this.translate.instant("CORRUPTED_JSON_FILE"));
          }
        });
  }

  showEditEcoeDrawer(ecoeEdit: ECOE) {
    this.ecoe = ecoeEdit;
    this.showEditEcoe = true;
  }

  async submitFormEditECOE(form: FormGroup) {

    this.shared.doFormDirty(this.validateForm);
    if (form.pending) {
      const sub = form.statusChanges.subscribe(() => {
        if (form.valid) {
          this.submitECOENameForm(form.value);
        }
        sub.unsubscribe();
      });
    } else if (form.valid) {
      this.submitECOENameForm(form.value);
    }
  }

  submitECOENameForm(value: any) {
    new ECOE(this.ecoe).update({name: value.ecoeName}).then(
      response => {
        this.message.createSuccessMsg(this.translate.instant('OK_REQUEST_CONTENT'), {nzDuration: 5000});
        this.ecoe = response;
        this.ecoeName = this.ecoe.name;
      }
    ).catch(
      error => {
        this.message.createErrorMsg(this.translate.instant('ERROR_REQUEST_CONTENT'), {nzDuration: 5000});
        value.setValue(this.ecoe.name);
      }
    ).finally(
      () => {
        this.closeDrawer();
      }
    );
  }
}
