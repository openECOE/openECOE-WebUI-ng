import { Component, OnInit } from '@angular/core';
import {ECOE, Organization, Round, Shift} from '../../models';

@Component({
  selector: 'app-outside',
  templateUrl: './outside.component.html',
  styleUrls: ['./outside.component.less']
})
export class OutsideComponent implements OnInit {

  private groupedEcoes: ECOEsByOrganization [] = [];
  private selectedOrganizationIdx: number = -1;
  private filtredECOEs: ECOEsByOrganization;
  private selectedDateIndex: number = -1;
  private selectedECOE: ECOEbyDate;

  constructor() { }

  ngOnInit() {
    this.getECOEsByOrganization()
      .then((result: ECOEsByOrganization[]) => {
        if (result && result.length > 0) {
          this.groupedEcoes = result;
          this.selectedOrganizationIdx = 0;
          this.onChangeOrganization(result[0].organization);
        }
      });
  }

  async getECOEsByOrganization() {
    const promiseArr = [];
    const groupedECOEs: ECOEsByOrganization[] = [];

    const organizations = await Organization.query({}) as Organization[];

    organizations.forEach((organization, idx) => {
      groupedECOEs[idx] = {organization: null, ecoes: []};
      const promise = ECOE.query({where: {organization: organization.id}}, {skip: ['organization', 'user', 'round'], cache: false})
        .then(async (ecoes: ECOE[]) => {
          groupedECOEs[idx].organization = organization;
            let n = 0;
            for (const ecoe of ecoes) {
              groupedECOEs[idx].ecoes[n] = {date: null, ecoe: null, finished: null, rounds: []};
              const queryParams = {
                  where: {ecoe: ecoe.id},
                  sort: {'time_start': false}
                };
               const options = {
                  skip: ['round', 'ecoe'],
                  cache: false
                };
              const auxShifts = (await Shift.query(queryParams, options));

              groupedECOEs[idx].ecoes[n].date = auxShifts[0] ? auxShifts[0].timeStart.toISOString() : null;
              groupedECOEs[idx].ecoes[n].ecoe = ecoe;
              groupedECOEs[idx].ecoes[n].rounds =  (await Round.query({where: {ecoe: ecoe.id}}, {skip: [], cache: false}) as Round[]);
              groupedECOEs[idx].ecoes[n].finished = new Date(new Date().setHours(0, 0, 0, 0)) > new Date(groupedECOEs[idx].ecoes[n].date);
              n++;
            }
          return groupedECOEs[idx];
        });
      promiseArr.push(promise);
    });
    return Promise.all(promiseArr).finally(() => groupedECOEs);
  }

  onChangeOrganization(orga: Organization) {
    if (this.groupedEcoes && this.groupedEcoes.length > 0) {
      this.filtredECOEs = this.groupedEcoes
        .filter(item => item.organization.id === orga.id)[0];
    }
    this.onChangeDate(this.filtredECOEs.ecoes[0] );
  }

  onChangeDate(ecoeItem: ECOEbyDate) {
    console.log('onChangeDate', ecoeItem);
    this.selectedECOE = ecoeItem;
  }
}

interface ECOEsByOrganization {
  organization: Organization;
  ecoes: ECOEbyDate[];
}

interface ECOEbyDate {
  ecoe: ECOE;
  date: string;
  rounds: Round[];
  finished: boolean;
}
