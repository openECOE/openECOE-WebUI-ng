import {Component, OnInit} from '@angular/core';
import {User, UserLogged} from '@app/models';
import { UserService } from '@app/services/user/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {

  userData: UserLogged;

  usersPage: any[] = [];

  loading: boolean = false;

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.userData = this.userService.userData;
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
