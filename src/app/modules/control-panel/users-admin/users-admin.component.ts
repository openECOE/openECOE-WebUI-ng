import {Component, OnInit} from '@angular/core';
import {User, UserLogged} from '../../../models';
import {AuthenticationService} from '../../../services/authentication/authentication.service';
import {Item} from '@openecoe/potion-client';
import {SharedService} from '../../../services/shared/shared.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users-admin',
  templateUrl: './users-admin.component.html',
  styleUrls: ['./users-admin.component.less']
})

export class UsersAdminComponent implements OnInit {

  userLogged: UserLogged;
  activeUser: User;

  passwordVisible = false;

  users = [];
  usersPage: any;
  editCache: CacheItem[] = [];

  page: number = 1;
  perPage: number = 20;
  totalItems: number = 0;
  loading: boolean = false;

  validateForm: FormGroup;
  showAddUser: boolean = false;
  importErrors: { value: any, reason: any }[] = [];

  constructor(private authService: AuthenticationService,
              private shared: SharedService,
              private fb: FormBuilder,
              private router: Router) {
  }

  ngOnInit() {
    this.validateForm = this.getUserForm();
    this.userLogged = this.authService.userData;
    this.activeUser = this.userLogged.user;
    this.loadUsers();
  }

  getUserForm(): FormGroup {
    // TODO: Validate if email exists
    return this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
      userName: [null],
      userSurname: [null],
      isSuperadmin: [false]
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
        this.loadPage(page);
      })
      .finally(() => this.loading = false);
  }

  pageChange(page: number) {
    this.loading = true;
    this.page = page;
    this.usersPage.changePageTo(page)
      .then(retPage => this.loadPage(retPage))
      .finally(() => this.loading = false);
  }

  pageSizeChange(pageSize: number) {
    this.perPage = pageSize;
    this.loadUsers();
  }

  loadPage(page: any) {
    this.usersPage = page;
    this.totalItems = this.usersPage.total;
    this.users = [...this.usersPage.items];
    this.updateEditCache(this.users, this.editCache);
  }

  assignEditCache(item: Item, editItem: boolean = false, newItem: boolean = false) {
    return {
      editItem: editItem,
      newItem: newItem,
      data: Object.assign(new User, item)
    };
  }

  updateEditCache(listItems: any[], editCache: any[]) {
    editCache = [];
    listItems.forEach((item, index) => {
      editCache[index] = this.assignEditCache(item, editCache[index] ? editCache[index].editItem : false, false);
    });
    this.editCache = editCache;
  }

  addUser(email: string = '',
          name: string = '',
          surname: string = '',
          superAdmin: boolean = false,
          password: string = null): Promise<any> {

    const newUser = new User({
      email: email,
      name: name,
      surname: surname,
      organization: this.activeUser.organization,
      isSuperadmin: !!superAdmin,
      password: password ? password : this.shared.generateRandomPassword()
    });

    return newUser.save();
  }

  editUser(idx: number) {
    this.editCache[idx].editItem = true;
  }

  saveUser(item: any) {
    var usercache = this.editCache.find(f => f.data.id == item.id);
    if (!usercache.data.name || !usercache.data.surname || !usercache.data.email) {
      return;
    }

    const body = {
      email: usercache.data.email,
      surname: usercache.data.surname,
      name: usercache.data.name,
    };

    const request = item.update(body);

    request.then(response => {
      var idx = this.editCache.indexOf(usercache);
      Object.assign(this.users[idx], Object.assign(usercache.data, response));
      usercache.editItem = false;
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
    this.importErrors = [];
    const respPromises = [];

    parserResult.forEach((value) => {


      const promise = this.addUser(
        value.email.toString(),
        value.name.toString(),
        value.surname.toString(),
        false,
        value.password.toString()
      )
        .then(resp => {
          console.log('User import', resp.email, resp);
          return resp;
        })
        .catch(reason => {
          console.warn('User import error', value, reason);
          this.importErrors.push(
            {
              value: value,
              reason: reason
            });
          return reason;
        });

      respPromises.push(promise);
    });

    Promise.all(respPromises)
      .finally(() => this.loadUsers());
  }

  cleanError(idx: number) {
  }

  cleanImportErrors() {
    this.importErrors = [];
  }

  showModal() {
    this.showAddUser = true;
  }

  closeModal() {
    this.shared.cleanForm(this.validateForm);
    this.showAddUser = false;
  }

  submitFormUser(value: any) {
    this.addUser(
      value.email,
      value.userName,
      value.userSurname,
      value.isSuperadmin,
      value.password)
      .then(user => {
        this.users = [...this.users, user];
        this.editCache.push(this.assignEditCache(user, false, true));
        this.shared.cleanForm(this.validateForm);
        this.loadUsers();
        this.closeModal();
      });
  }

  onBack() {
    this.router.navigate(['/control-panel']).finally();
  }

}

export class CacheItem {
  data: any;
  editItem: boolean;
  newItem: boolean;
}
