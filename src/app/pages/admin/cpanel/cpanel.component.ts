import {Component, OnInit} from '@angular/core';
import {User, UserLogged} from '../../../models';
import {AuthenticationService} from '../../../services/authentication/authentication.service';
import {Item} from '@infarm/potion-client';

@Component({
  selector: 'app-cpanel',
  templateUrl: './cpanel.component.html',
  styleUrls: ['./cpanel.component.less']
})
export class CpanelComponent implements OnInit {

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
