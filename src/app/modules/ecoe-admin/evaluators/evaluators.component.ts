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

  page: number = 1;
  perPage: number = 20;
  totalItems: number = 0;
  loading: boolean = false;

  // FORMULARIO EDITAR
  evaluatorEditar: ApiPermissions;
  evaluatorOriginal: ApiPermissions;

  validateForm: FormGroup;
  showAddEvaluator: boolean;
  showMessageDelete: boolean = false;
  showEditEvaluator: boolean = false;

  listStations: Station[] = [];

  evaluatorRow = {
    email: ['', Validators.required],
    stations: ['', Validators.required],
    round: ['', Validators.required]
  };

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

    async ngOnInit() {
      this.route.params.subscribe(async (params) => {
        this.ecoeId = +params.ecoeId;
        this.loading = true;
  
        try {
          this.ecoe = await ECOE.fetch<ECOE>(this.ecoeId, { cache: false });
          this.ecoe_name = this.ecoe.name;
          this.listStations = await this.getStations();
          
          await this.loadEvaluators(); 
          this.getPermissionForm();
          //this.InitEvaluatorRow();
        } catch (error) {
          console.error('Error al obtener la ECOE:', error);
        } finally {
          this.loading = false;
        }
      });
  }
  
  async getStations(): Promise<Station[]> {
    return Station.query<Station>({where: {ecoe: this.ecoe}});
  }

  async getPermissionForm() {
    // TODO: Validate if email exists
    this.validateForm = this.fb.group({
      email: [null,[Validators.required]],
      stations: [null]
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
      const sortDict = {};
      // tslint:disable-next-line:forin
      for (const key in this.mapOfSort) {
        const value = this.mapOfSort[key];
        if (value !== null) {
          sortDict[key] = value !== 'ascend';
          if (key === 'name') {
            sortDict['name'] = value !== 'ascend';
            sortDict['name_order'] = value !== 'ascend';
          }
        }
      }
      
      this.editCache = {};
      
     const usersWithEvalautePermission = await this.apiService.getEvaluators(this.ecoe);
     usersWithEvalautePermission.forEach((evaluator) => this.evaluators.push({id: evaluator.id, stations: null, user: evaluator}));

      for (const evaluator of this.evaluators) {
        evaluator.stations = await this.apiService.getStationsByEvaluator(evaluator.user, this.ecoe);
      }

      this.totalItems = this.evaluators.length;  
      this.updateEditCache();
    } catch (error) {
      console.error('Error al cargar los evaluadores:', error);
    } finally {
      this.loading = false;
    }
  }
  
  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   *
   * @param item determines if the resource is already saved
   */
  updateItem(item: any): void {
    if (!this.editCache[item.id].email || !this.editCache[item.id].name || !this.editCache[item.id].surnames) {
      return;
    }

    const body = {
      email: this.editCache[item.id].email,
      name: this.editCache[item.id].name,
      surnames: this.editCache[item.id].surnames,
    };

    const request = item.update(body);

    request.then(response => {
      this.evaluators = this.evaluators.map(x => (x.id === item.id) ? response : x);
      this.editCache[response.id].edit = false;
    });
  }

  /**
   * Updates editCache variable with the same values of the resources array and adds a 'edit' key.
   */
  updateEditCache(): void {
    this.evaluators.forEach(item => {
      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        ...item
      };
    });
  }

  /**
   * Deletes the editCache key assigned to the resource id passed and filters out the item from the resources array.
   *
   * @param evaluatorId Id of the resource passed
   */
  updateArrayEvaluators(evaluatorId: number | string | null) {
    delete this.editCache[evaluatorId];
    this.evaluators = this.evaluators.filter(x => x.id !== evaluatorId);
  }

  importEvaluators(parserResult: any): void {
    const fileData: any[] = parserResult as Array<any>
    const evaluators = fileData.filter(item => item["email"] !== null);

    this.saveEvaluators(evaluators)
      .then(() => console.log('success'))
      .catch((err) => {
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
    //await this.updateUserStations(permission.user, value.roles);

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

  async addPermission(email: string, stationName: string) {
    console.log('addPermission', email, stationName);
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
    permission.destroy();
  }

  sort(sortName: string, value: string): void {
    for (const key in this.mapOfSort) {
      this.mapOfSort[key] = key === sortName ? value : null;
    }

    this.loadEvaluators();
  }

  async submitFormEvaluator(form: FormGroup) {
    this.shared.doFormDirty(form);
    if (form.pending) {
        const sub = form.statusChanges.subscribe(() => {
            if (form.valid) {
                const selectedStations: Station[] = form.value.stations;
                selectedStations.forEach(async (station: Station) => {
                    await this.submitForm({ email: form.value.email, station: station.name });
                });
            }
            sub.unsubscribe();
        });
    } else if (form.valid) {
        const selectedStations: Station[] = form.value.stations;
        selectedStations.forEach(async (station: Station) => {
            await this.submitForm({ email: form.value.email, station: station.name });
        });
    }
  }

  async submitForm(value: any) {
    try {
      if (this.showAddEvaluator) {
        await this.addPermission(
          value.email,
          value.station
        );
      } else if (this.showEditEvaluator) {
        await this.updatePermission(this.evaluatorOriginal, value);
      }

      this.loadEvaluators();
    } catch (error) {
      console.error(error);
      this.message.create(
        "error",
        "Error al guardar la información del evaluador"
      );
    }
    this.closeModal();
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

  closeModal() {
    this.shared.cleanForm(this.validateForm);
    this.showAddEvaluator = false;
    this.showEditEvaluator = false;
  }

}