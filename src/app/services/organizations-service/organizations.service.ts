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
        if (user) {
          this._currentOrganization = user?.user?.organization || null;
          this.currentOrganizationChange.next(this._currentOrganization);
        }});
  }
  
  set currentOrganization(organization: Organization) {
    this._currentOrganization = organization;
    this.currentOrganizationChange.next(organization);
  }
  
  getOrganizations(): Promise<Organization[]> {
    return Organization.query<Organization>();
  }

  getOrganizationsPage(queryParams) {
    return Organization.query(queryParams, { paginate: true })
      .then((page: any) => {
        page.items.map((item: Organization) => {
          id: item.id; 
          name: item.name;
        });
        return page;
      })
      .catch((err) => err);
  }
  
  
  getEcoesByOrganization(): Promise<ECOE[]> {
    return ECOE.query<ECOE>({
      where: {organization: this._currentOrganization}
    });
  }

}