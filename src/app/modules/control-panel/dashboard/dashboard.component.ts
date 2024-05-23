import {Component, OnInit} from '@angular/core';
import {Organization, User, UserLogged} from '@app/models';
import { UserService } from '@app/services/user/user.service';
import { Router } from '@angular/router';

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
    private router: Router
  ) {
  }

  ngOnInit() {
    this.userData = this.userService.userData;
    this.loadUsers();
    this.loadOrganizations();
    this.router.navigate(['control-panel/users']);
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

  goBack() {
    this.router.navigate(['/ecoe']);
  }
  
}
