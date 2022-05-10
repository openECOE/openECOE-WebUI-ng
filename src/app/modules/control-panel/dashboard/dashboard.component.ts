import {Component, OnInit} from '@angular/core';
import {User, UserLogged} from '../../../models';
import {Item} from '@openecoe/potion-client';
import {AuthenticationService} from '../../../services/authentication/authentication.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {

  userData: UserLogged;

  usersPage: any[] = [];

  loading: boolean = false;

  constructor(private authService: AuthenticationService) {
  }

  ngOnInit() {
    this.userData = this.authService.userData;
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    User.query({
      where: {organization: this.userData.user.organization}
    }, {paginate: true})
      .then((page) => this.usersPage = page)
      .finally(() => this.loading = false);
  }
}
