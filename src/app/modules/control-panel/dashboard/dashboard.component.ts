import {Component, OnInit} from '@angular/core';
import {Organization, User, UserLogged} from '@app/models';
import { OrganizationsService } from '@app/services/organizations-service/organizations.service';
import { UserService } from '@app/services/user/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {

  userData: UserLogged;

  usersPage: any[] = [];
  organizationsPage: any[] = [];

  loading: boolean = false;

  constructor(
    private userService: UserService,
    private organizationsService: OrganizationsService
  ) {
  }

  ngOnInit() {
    this.userData = this.userService.userData;
    this.loadUsers();
    this.loadOrganizations();
  }

  loadUsers() {
    this.loading = true;
    User.query({
      where: {organization: this.userData.user.organization}
    }, {paginate: true})
      .then((page) => this.usersPage = page)
      .finally(() => this.loading = false);
  }

  loadOrganizations() {
    this.loading = true;
    Organization.query({}, {paginate: true})
      .then((page) => this.organizationsPage = page)
      .finally(() => this.loading = false);
  }
}
