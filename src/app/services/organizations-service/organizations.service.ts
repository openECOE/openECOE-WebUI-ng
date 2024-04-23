import { Injectable, OnInit } from '@angular/core';
import { ECOE, Organization } from '@app/models';
import { UserService } from '../user/user.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganizationsService  {
  private _currentOrganization;
  public currentOrganizationChange: Subject<Organization> = new Subject<Organization>();

  constructor(private userService: UserService) {
    this._init();
  }

  _init(): void {
    this.userService.userDataChange.subscribe(
      (user) => {
        console.log('init')
        this._currentOrganization = user.user.organization;
        this.currentOrganizationChange.next(user.user.organization);
      })
  }
  /*
  get currentOrganization(): Subject<Organization> {
    return this.currentOrganization;
  }
  */

  /*
  set currentOrganization(organization: Organization) {
    this.currentOrganizationChange.next(organization);
  }
  */

  getOrganizations(): Promise<Organization[]> {
    return Organization.query<Organization>();
  }

  getEcoesByOrganization(): Promise<ECOE[]> {
    return ECOE.query<ECOE>({
      where: {organization: this._currentOrganization}
    });
  }



  

}
