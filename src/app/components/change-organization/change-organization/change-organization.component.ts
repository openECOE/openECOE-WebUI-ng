import { Component, OnDestroy, OnInit } from '@angular/core';
import { Organization } from '@app/models';
import { OrganizationsService } from '@app/services/organizations-service/organizations.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-organization',
  templateUrl: './change-organization.component.html',
  styleUrls: ['./change-organization.component.less']
})
export class ChangeOrganizationComponent implements OnInit, OnDestroy {
  currentOrganization: Organization;
  organizations: Organization[];

  organizations$: Subscription;

  constructor(
    private organizationsService: OrganizationsService
  ) { }

  ngOnInit(): void {
    this.organizationsService
      .getOrganizations()
      .then(organization => this.organizations = organization);
      
    Organization.first()
      .then((org: Organization) => this.currentOrganization = org);

    this.organizations$ = this.organizationsService 
      .currentOrganizationChange
      .subscribe(organization => this.currentOrganization = organization);
  }

  ngOnDestroy(): void {
    this.organizations$.unsubscribe();
  }

  changeCurrentOrganization(selectedOrganization: Organization): void {
    this.organizationsService.currentOrganization = selectedOrganization;
  }

}
