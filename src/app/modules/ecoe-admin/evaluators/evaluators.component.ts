import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ParserFile } from '@app/components/upload-and-parse/upload-and-parse.component';
import { Answer, ApiPermissions, ECOE, Round, Station, User } from '@app/models';
import { ApiService } from '@app/services/api/api.service';
import { SharedService } from '@app/services/shared/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { Item, Pagination, Route } from '@openecoe/potion-client';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-evaluators',
  templateUrl: './evaluators.component.html',
  styleUrls: ['./evaluators.component.less']
})
export class EvaluatorsComponent implements OnInit {
  evaluators: ApiPermissions[] = [];
  ecoeId: number;
  ecoe: ECOE;
  ecoe_name: string;
  editCache = {};
  index: number = 1;

  addEvaluatorDraw: boolean = false;

  page: number = 1;
  perPage: number = 20;
  totalItems: number = 0;

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

  loading: boolean = false;

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

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.ecoeId = +params.ecoeId;
      ECOE.fetch<ECOE>(this.ecoeId, { cache: false}).then((ecoe) => {
        this.ecoe = ecoe;
        this.ecoe_name = this.ecoe.name;
      })

      this.loadEvaluators();
      //this.InitEvaluatorRow();
    });
  }

  /**
   * Load evaluators by the passed ECOE.
   * Then calls [updateEditCache]{@link #updateEditCache} function.
   */

  async loadEvaluators() {
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
  
      const pagEvaluators = await ApiPermissions.query<ApiPermissions, Pagination<ApiPermissions>>({
        where: {
          name: "evaluate",
          object: "stations",
        },
        sort: sortDict,
        perPage: this.perPage,
        page: this.page
      }, { paginate: true });
  
      this.editCache = {};
      this.evaluators = pagEvaluators['items'];
      this.totalItems = pagEvaluators['total'];

      for (const evaluator of this.evaluators) {
        evaluator.stations = await this.getStations(evaluator);
      }

      this.updateEditCache();
    } catch (error) {
      console.error('Error al cargar los evaluadores:', error);
    } finally {
      this.loading = false;
    }
  }

  async getStations(apiPermissions: ApiPermissions): Promise<string[]> {
    if (apiPermissions.object === 'stations') {
      try {
        let stations = await Station.query<Station>({
          where: {
            ecoe: this.ecoe,
            order: apiPermissions.idObject,
          }
        });

        if (stations.length > 0) {
          return stations.map(station => station.name);
        } else {
          console.error('No se encontraron estaciones.');
          return [];
        }
      } catch (error) {
        console.error('Error al obtener las estaciones:', error);
        return [];
      }
    } else {
      return [];
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
        console.error('save error: ', err)
        // TODO: borrar el permiso de lectura también
        this.successFulPermissions.forEach((perm: ApiPermissions) => perm.destroy());
      });
  }

  saveEvaluators(items: any[]): Promise<any> {
    const savePromises = [];
    this.logPromisesERROR = [];
    this.logPromisesOK = [];
    
    const noItem = {
      statusText: 'no Item',
      message: this.translate.instant('INVALID_ITEM')
    };

    for (const item of items) {
      console.log(item);
      if(item.email && item.station) {
        const promise = this.addPermission(
          item.email.toString(),
          item.station.toString(),
        )
          .then((result) => {
            this.logPromisesOK.push(result)
            this.successFulPermissions.push(result);
            return result;
          })
          .catch((reason) => {
            if(reason instanceof HttpErrorResponse)  {
              reason = new Error(this.translate.instant('PERMISSION_ALREADY_EXISTS', {username: item.email, station: item.station}))
            }
            this.logPromisesERROR.push({
              value: item,
              reason
            });
            return reason;
          });

        savePromises.push(promise);
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

  sort(sortName: string, value: string): void {
    for (const key in this.mapOfSort) {
      this.mapOfSort[key] = key === sortName ? value : null;
    }

    this.loadEvaluators();
  }

  onBack() {
    this.router.navigate(['/ecoe/' + this.ecoeId + '/admin']).finally();
  }

  clearImportErrors() {
    this.logPromisesERROR = [];
  }
}

export class Evaluator extends Item {
  email: string;
  name: string;
  surnames: string;

  ecoe: ECOE | number;
  station: Station | Item;
  round: Round | Item;
  name_order?: number;

  public set nameOrder(v: number) {
    this.name_order = v;
  }

  public get nameOrder(): number {
    return this.name_order;
  }

  addAnswer? = Route.POST("/answers");

  getAnswers? = Route.GET("/answers");
  getAllAnswers? = Route.GET<Array<Answer>>("/answers/all");
  getAnswersStation? = (station: Number) =>
    Route.GET("/answers/station/" + station.toString());

  save(): Promise<this> {
    return super.save();
  }
}