import {Component, OnInit} from '@angular/core';
import {Station, User, UserLogged} from '../../../../models';
import {AuthenticationService} from '../../../../services/authentication/authentication.service';
import {Item, Pagination} from '@infarm/potion-client';
import {SharedService} from '../../../../services/shared/shared.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-users-admin',
  templateUrl: './users-admin.component.html',
  styleUrls: ['./users-admin.component.less']
})

export class UsersAdminComponent implements OnInit {

  userLogged: UserLogged;
  activeUser: User;


  users: User[] = [];
  usersPage: any;
  editCache: CacheItem[] = [];

  page: number = 1;
  perPage: number = 20;
  totalItems: number = 0;
  loading: boolean = false;

  validateForm: FormGroup;
  showAddUser: boolean = false;

  constructor(private authService: AuthenticationService,
              private shared: SharedService,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.validateForm = this.getUserForm();
    this.userLogged = this.authService.userData;
    this.activeUser = this.userLogged.user;
    this.loadUsers();
  }

  getUserForm(): FormGroup {
    return this.fb.group({
      userEmail: [null, [Validators.required]],
      password: [null, [Validators.required]],
      userName: [null, [Validators.required]],
      userSurname: [null, [Validators.required]],
    });
  }

  loadUsers() {
    this.loading = true;
    User.query({
      where: {organization: this.activeUser.organization},
      page: this.page,
      perPage: this.perPage
    }, {paginate: true})
      .then(page => {
        this.usersPage = page;
        this.users = this.usersPage.items;
        this.totalItems = this.usersPage.total;
        this.updateEditCache(this.users, this.editCache);
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

  assignEditCache(item: Item, editItem: boolean = false, newItem: boolean = false) {
    const cacheItem = new User;

    return {
      editItem: editItem,
      newItem: newItem,
      data: Object.assign(cacheItem, item)
    };
  }

  updateEditCache(listItems: any[], editCache: any[]) {
    listItems.forEach((item, index) => {
      const cacheItem = new User;
      editCache[index] = this.assignEditCache(item, editCache[index] ? editCache[index].editItem : false, false);
    });
  }

  findCacheItem(cacheList: any[], item: any) {

  }

  addUser(email: string = '',
          name: string = '',
          surname: string = '',
          superAdmin: boolean = false,
          password: string = null) {
    // Go to last page
    // this.page = this.usersPage.pages;
    // this.loadUsers();
    const newUser = new User({
      email: email,
      name: name,
      surname: surname,
      organization: this.activeUser.organization,
      isSuperadmin: superAdmin,
      password: password ? password : this.shared.generateRandomPassword()
    });

    this.users = [...this.users, newUser];
    this.editCache.push(this.assignEditCache(newUser, true, true));
  }

  editUser(idx: number) {
    this.editCache[idx].editItem = true;
  }

  saveUser(idx: number) {
    this.editCache[idx].data.save()
      .then(userSaved => {
        Object.assign(this.users[idx], Object.assign(this.editCache[idx].data, userSaved));
        this.editCache[idx].editItem = false;
      });
  }

  delUser(idx: number) {
    this.users[idx].destroy()
      .then(() => {
        this.removeUserList(idx);
      });
  }

  removeUserList(idx: number) {
    delete this.users[idx];
    delete this.editCache[idx];
    this.users = this.users.filter((value) => value !== this.users[idx]);
  }

  cancelUser(idx: number) {
    this.editCache[idx].editItem = false;

    this.editCache[idx].newItem ?
      this.removeUserList(idx)
      :
      Object.assign(this.editCache[idx].data, this.users[idx]);
  }

  importUsers(parserResult: Array<any>) {

  }

  showModal() {
    this.showAddUser = true;
  }

  cancelModal() {
    this.showAddUser = false;
  }


}

export class CacheItem {
  data: any;
  editItem: boolean;
  newItem: boolean;
}
