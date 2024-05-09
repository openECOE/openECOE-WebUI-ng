import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ParserFile } from '@app/components/upload-and-parse/upload-and-parse.component';
import { Answer, ApiPermissions, ECOE, Round, Station, User } from '@app/models';
import { ApiService } from '@app/services/api/api.service';
import { SharedService } from '@app/services/shared/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { Pagination } from '@openecoe/potion-client';
import { NzMessageService } from 'ng-zorro-antd/message';
import { filter, startWith, take } from 'rxjs/operators';

interface Evaluator {
  id: number;
  user: User;
  stations: Station[];
}

@Component({
  selector: 'app-evaluators',
  templateUrl: './evaluators.component.html',
  styleUrls: ['./evaluators.component.less']
})
export class EvaluatorsComponent implements OnInit {
  // evaluators: ApiPermissions[] = [];
  asdasd = 'asdasd';
  evaluators: Evaluator[] = [];
  pagEvaluators: Pagination<User>;
  ecoeId: number;
  ecoe: ECOE;
  ecoe_name: string;
  editCache = {};
  index: number = 1;

  addEvaluatorDraw: boolean = false;

  totalItems: number = 0;
  loading: boolean = false;

  // FORMULARIO EDITAR
  evaluatorOriginal: Evaluator;

  validateForm: FormGroup;
  showAddEvaluator: boolean;
  showMessageDelete: boolean = false;
  showEditEvaluator: boolean = false;

  listStations: Station[] = [];
  listUsers: User[] = [];
  
  evaluatorForm: FormGroup;
  evaluatorControl: FormArray;

  logPromisesERROR = [];
  logPromisesOK = [];
  successFulPermissions = [];

  indeterminate = false;

  mapOfSort: { [key: string]: any } = {
    email: null,
    station: null,
    round: null,
  };

  evaluatorsParser: ParserFile = {
    "filename": "evaluators.csv",
    "fields": ["email", "station"],
    "data": [
      ["email1@dominio.com", "E001"],
      ["email2@dominio.com", "E002"],
      ["email2@dominio.com", "E003"],
    ]
  }

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    public shared: SharedService,
    private fb: FormBuilder,
    private router: Router,
    private translate: TranslateService,
    private message: NzMessageService) { 

      this.evaluatorForm = this.fb.group({
        evaluatorRow: this.fb.array([])
      });
  
      this.evaluatorControl = <FormArray>this.evaluatorForm.controls.evaluatorRow;
    }

    ngOnInit() {
      this.route.params.subscribe((params) => {
        this.ecoeId = +params.ecoeId;
        this.loading = true;

        ECOE.fetch<ECOE>(this.ecoeId, { cache: false })
          .then((ecoe) => {
            this.ecoe = ecoe;
            this.ecoe_name = ecoe.name;
            return Promise.all([this.getStations(), this.getUsers()]);
          })
          .then(([stations, users]) => {
            this.listStations = stations;
            this.listUsers = users;
            this.loadEvaluators();
            this.loading = false;
            this.getPermissionForm();
          })
          .catch((error) => {
            console.error('Error:', error);
            this.loading = false;
          });
      });
  }
  
  async getStations(): Promise<Station[]> {
    return Station.query<Station>({where: {ecoe: this.ecoe}});
  }

  async getUsers(): Promise<User[]> {
    const evaluators = await this.apiService.getEvaluators(this.ecoe);
    const allUsers = await User.query<User>();

    const nonEvaluators = allUsers.filter(user => !evaluators.some(evaluator => evaluator.id === user.id));

    return nonEvaluators;
  }

  async getPermissionForm() {
    // TODO: Validate if email exists
    this.validateForm = this.fb.group({
      email: [null,[Validators.required]],
      stations: [null, [Validators.required]]
    });
  }

  /**
   * Load evaluators by the passed ECOE.
   * Then calls [updateEditCache]{@link #updateEditCache} function.
   */

  async loadEvaluators() {
    this.evaluators = [];
    this.loading = true;
  
    try {      
     const usersWithEvalautePermission = await this.apiService.getEvaluators(this.ecoe);
     usersWithEvalautePermission.forEach((evaluator) => this.evaluators.push({id: evaluator.id, stations: null, user: evaluator}));

      for (const evaluator of this.evaluators) {
        evaluator.stations = await this.apiService.getStationsByEvaluator(evaluator.user, this.ecoe);
      }
      this.totalItems = this.evaluators.length;  
    } catch (error) {
      console.error('Error al cargar los evaluadores:', error);
    } finally {
      this.loading = false;
    }
  }
  
  importEvaluators(parserResult: any): void {
    const fileData: any[] = parserResult as Array<any>
    const evaluators = fileData.filter(item => item["email"] !== null);

    this.saveEvaluators(evaluators)
      .then(() => this.loadEvaluators())
      .catch((err) => {
        // TODO: comprobar esto
        this.logPromisesOK.forEach((perm: ApiPermissions) => this.deletePermissions(perm));
      });
  }

  async updatePermission(permission: ApiPermissions, value: any) {
    const updateData = {
      user: value.user,
      name: value.name,
      idObject: value.idObject,
      object: value.object
    };

    await permission.update(updateData);

    this.message.success(
      this.translate.instant("USER_UPDATED", { email: permission.user.email })
    );
  }

  async saveEvaluators(items: any[]): Promise<any> {
    const savePromises = [];
    this.logPromisesERROR = [];
    this.logPromisesOK = [];
    
    const noItem = {
      statusText: 'no Item',
      message: this.translate.instant('INVALID_ITEM')
    };

    for (const item of items) {
      if(item.email && item.station) {
        let promise;
        try {
          promise = await this.addPermission(item.email.toString(), item.station.toString());
          this.logPromisesOK.push(promise);
          
        } catch (reason) {
          if(reason instanceof HttpErrorResponse)  {
            reason = new Error(this.translate.instant('PERMISSION_ALREADY_EXISTS', {username: item.email, station: item.station}))
          }
          this.logPromisesERROR.push({
            value: item,
            reason
          });
          
          savePromises.push(promise);
        }
      }
      else {
        this.logPromisesERROR.push({
          value: JSON.stringify(item),
          reason: noItem
        });
      }
    }

    return Promise.all(savePromises)
      .then(() => 
        new Promise((resolve, reject) =>
          this.logPromisesERROR.length > 0 ? reject(this.logPromisesERROR) : resolve(items)))
      .catch(err => new Promise((resolve,reject) => reject(err)));
  }

  async delEvaluator(evaluator: Evaluator, batch: boolean = false) {
    try {
      const stations = evaluator.stations;
      
      for (const station of stations) {
        const permission = await this.apiService.getPermissionForStation(evaluator.user, station);
        if (permission) {
          await this.deletePermissions(permission);
          console.log('Permiso borrado');
        }
      }
      
      if (!batch) {
        this.message.success(
          this.translate.instant("EVALUATOR_DELETED", { email: evaluator.user.email })
        );
      }

      console.log("Recargar evaluadores");
      this.loadEvaluators();
    } catch (error) {
      this.message.error(this.translate.instant("ERROR_DELETE_EVALUATOR"));
    }
  }
  
  async addPermission(email: string, stationName: string) {
    let user = await User.first<User>({where: {email}});
    if(!user) {
      return Promise.reject(new Error(this.translate.instant('USER_NOT_FOUND', {username: email})))
    }

    let station = await Station.first<Station>({
        where: {
          ecoe: this.ecoe,
          name: stationName,
        }
      });
    if(!station) {
      return Promise.reject(new Error(this.translate.instant('IMPORTED_STATION_NOT_FOUND', {stationName})));
    }

    try {
      return this.apiService.addPermision(user, 'evaluate', station.id, 'stations');
    } catch (error) {
      throw error;
    }
  }

  async deletePermissions(permission: ApiPermissions) {    
    let readPermission = await ApiPermissions.first<ApiPermissions>({
      where: {
        idObject: this.ecoe.id,
        object: 'ecoes',
        name: "read",
        user: permission.user,
      }});

    if(readPermission) { readPermission.destroy()}
    return permission.destroy();
  }

  submitFormEvaluator(form: FormGroup) {
    this.shared.doFormDirty(form);

    (async () => {
    if(this.showAddEvaluator) {
      return this.createEvaluator(form.value.email, form.value.stations);
    } 
      return this.editPermissions(form.value.stations);
    
  })().then(() => {
    this.loadEvaluators()
    this.closeModal()
  })
  }

  async createEvaluator(email: string, stations: Station[]) {
    for (const station of stations) {
      await this.addPermission(email, station.name)
    }
  }

  async editPermissions(newStations: Station[]) {
    let user = await User.first<User>({where: {email: this.evaluatorOriginal.user.email}});
    if(!user) {
      return Promise.reject(new Error(this.translate.instant('USER_NOT_FOUND', {username: this.evaluatorOriginal.user.email})))
    }    
    const previousStations = await this.apiService.getStationsByEvaluator(user, this.ecoe);

    let difference = previousStations.filter(station => !newStations.includes(station))
      .concat(newStations.filter(station => !previousStations.includes(station)));
    console.log(difference);

    for (const station of difference) {
      let permission = await this.apiService.getPermissionForStation(user, station);
      if(permission) {
        await permission.destroy();
      }  else {
        await this.addPermission(user.email, station.name);
      }
    }
  }

  onBack() {
    this.router.navigate(['/ecoe/' + this.ecoeId + '/admin']).finally();
  }

  clearImportErrors() {
    this.logPromisesERROR = [];
  }
  showModal() {
    this.showAddEvaluator = true;
  }

  showModalDelete() {
    this.showMessageDelete = true;
  }

  showModalEdit(modalEditEvaluator: Evaluator) {
    this.evaluatorOriginal = modalEditEvaluator;
    this.validateForm.controls["stations"].setValue(modalEditEvaluator.stations);

    this.showEditEvaluator = true;
  }

  closeModal() {
    this.shared.cleanForm(this.validateForm);
    this.showAddEvaluator = false;
    this.showEditEvaluator = false;
  }

}