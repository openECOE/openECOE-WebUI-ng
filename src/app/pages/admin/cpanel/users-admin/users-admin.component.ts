import {Component, OnInit} from '@angular/core';
import {Station, User, UserLogged} from '../../../../models';
import {AuthenticationService} from '../../../../services/authentication/authentication.service';
import {Pagination} from '@infarm/potion-client';

@Component({
  selector: 'app-users-admin',
  templateUrl: './users-admin.component.html',
  styleUrls: ['./users-admin.component.less']
})
export class UsersAdminComponent implements OnInit {

  userLogged: UserLogged;


  users: User[];
  usersPage: any;
  editCache: { edit: boolean, new_item: boolean, item: User }[] = [];

  page: number = 1;
  perPage: number = 20;
  totalItems: number = 0;
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
      where: {organization: this.userLogged.user.organization},
      page: this.page,
      perPage: this.perPage
    }, {paginate: true})
      .then(page => {
        this.usersPage = page;
        this.users = this.usersPage.items;
        this.totalItems = this.usersPage.total;
        this.updateEditCache(this.usersPage.items, this.editCache);
      })
      .finally(() => this.loading = false);
  }

  pageChange(page: number) {
    this.usersPage.page = page;
    this.loadUsers();
    // this.pagStations.changePageTo(page)
    //   .then(value => this.stations = value.items);
  }

  pageSizeChange(pageSize: number) {
    this.usersPage.perPage = pageSize;
    this.loadUsers();
  }

  updateEditCache(listItems: any[], editCache: any[]) {
    listItems.forEach((item, index) => {
      const cacheItem = new User;

      editCache[index] = {
        edit: editCache[index] ? editCache[index].edit : false,
        new_item: false,
        item: Object.assign(cacheItem, item)
      };
    });
  }

  findCacheItem(cacheList: any[], item: any) {

  }

  addUser() {

  }

  editUser(idx: number) {
    this.editCache[idx].edit = true;
  }

  saveUser(idx: number) {
    this.editCache[idx].item.save()
      .then(userSaved => {
        // If saved item proceed to assign users array
        const idxUser = this.users.findIndex(item => item.id === this.editCache[idx].item.id);

        idxUser > -1 ?
          Object.assign(this.users[idxUser], this.editCache[idx].item)
          :
          this.users.push(userSaved);

        this.editCache[idx].edit = false;
      });
  }

  delUser(idx: number) {
    const idxUser = this.users.findIndex(item => item.id === this.editCache[idx].item.id);
    this.users[idxUser].destroy()
      .then(() => {
        delete this.users[idxUser];
        delete this.editCache[idx];
      });
  }

  cancelUser(idx: number) {
    this.editCache[idx].edit = false;

    const idxUser = this.users.findIndex(item => item.id === this.editCache[idx].item.id);

    (idxUser > -1) ?
      Object.assign(this.editCache[idx].item, this.users[idxUser])
      :
      delete this.editCache[idx];
  }

  importUsers(parserResult: Array<any>) {

  }


}
