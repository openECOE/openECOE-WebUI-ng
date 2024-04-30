import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParserFile } from '@app/components/upload-and-parse/upload-and-parse.component';
import { ApiPermissions, ECOE, Round, Station, User } from '@app/models';
import { ApiService } from '@app/services/api/api.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-evaluators',
  templateUrl: './evaluators.component.html',
  styleUrls: ['./evaluators.component.less']
})
export class EvaluatorsComponent implements OnInit {
  ecoeId: number;
  ecoe_name: string;
  ecoe: ECOE;

  logPromisesERROR = [];
  logPromisesOK = [];
  successFulPermissions = [];

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
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.ecoeId = +params.ecoeId;
      ECOE.fetch<ECOE>(this.ecoeId, { cache: false}).then((ecoe) => {
        this.ecoe = ecoe;
        this.ecoe_name = this.ecoe.name;
      })
    });
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

  onBack() {
    this.router.navigate(['/ecoe/' + this.ecoeId + '/admin']).finally();
  }

  clearImportErrors() {
    this.logPromisesERROR = [];
  }
}