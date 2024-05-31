import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Organization } from '@app/models';
import { OrganizationsService } from '@app/services/organizations-service/organizations.service';
import { UserService } from '@app/services/user/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-organization',
  templateUrl: './change-organization.component.html',
  styleUrls: ['./change-organization.component.less']
})
export class ChangeOrganizationComponent implements OnInit {
  currentOrganization: Organization;
  organizations: Organization[];

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getOrganizations();
    this.currentOrganization = this.userService.userData.user.organization;

    this.userService.userDataChange.subscribe((user) => {
      this.currentOrganization = user.user.organization;
    });
  }

  async getOrganizations(): Promise<void> {
    this.organizations = await Organization.query();
  }

  async changeCurrentOrganization(selectedOrganization: Organization): Promise<void> {
    const data = {
      organization: selectedOrganization
    }

    try {
      await this.userService.userData.user.update(data); 
    } catch (err) {
      console.log("Error while changing organization: " + err);
    }

    //this.currentOrganization = this.userService.userData.user.organization;
    await this.userService.loadUserData();
    window.location.reload();
  }
}
