import {Component, OnInit} from '@angular/core';
import {User, UserLogged} from '../../../../models';
import {Item} from '@infarm/potion-client';
import {AuthenticationService} from '../../../../services/authentication/authentication.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {

  userLogged: UserLogged;

  users: User | Item[] = [];

  loading: boolean = false;

  constructor(private authService: AuthenticationService) {
  }

  ngOnInit() {
    this.userLogged = this.authService.userData;
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    User.query({
      where: {organization: this.userLogged.user.organization}
    })
      .then(users => this.users = users)
      .finally(() => this.loading = false);
  }
}
