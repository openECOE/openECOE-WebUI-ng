import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Organization } from '@app/models';
import { UserService } from '@app/services/user/user.service';

@Component({
  selector: 'app-change-organization',
  templateUrl: './change-organization.component.html',
  styleUrls: ['./change-organization.component.less']
})
export class ChangeOrganizationComponent implements OnInit {
  currentOrganization: Organization;
  organizations: Organization[];
  isSuperAdmin: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getOrganizations();

    this.userService.userDataChange.subscribe((user) => {
      this.isSuperAdmin = user.isSuper;
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
    await this.router.navigate(['/ecoe']);
    window.location.reload();
  }
}
