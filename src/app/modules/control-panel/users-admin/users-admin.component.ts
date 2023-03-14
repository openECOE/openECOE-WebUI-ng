import {Component, EventEmitter, Inject, inject, Input, NgZone, OnInit, Output} from '@angular/core';
import {Role, RoleType, User, UserLogged} from '@app/models';
import {SharedService} from '@services/shared/shared.service';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import {ApiService} from '@services/api/api.service';
import { DOCUMENT } from '@angular/common';
import { UserService } from '@app/services/user/user.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { valueFunctionProp } from 'ng-zorro-antd';
import { findLast } from '@angular/compiler/src/directive_resolver';


interface UserItem extends User {
  rolesList: Array<Role>;
}

@Component({
  selector: 'app-users-admin',
  templateUrl: './users-admin.component.html',
  styleUrls: ['./users-admin.component.less']
})

export class UsersAdminComponent implements OnInit {

  user: UserLogged;
  activeUser: User;

  @Input() showDeleteButton: boolean = true;
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();

  passwordVisible = false;

  users: Array<UserItem> = [];
  usersPage: any;
  editCache: CacheItem[] = [];

  page: number = 1;
  perPage: number = 20;
  totalItems: number = 0;
  loading: boolean = false;

  // FORMULARIO EDITAR
  usuarioEditar: User| null; 
  usuarioOriginal: User;

  validateForm: FormGroup;
  showAddUser: boolean = false;
  showMessageDelete: boolean=false;
  showEditUser: boolean = false;
  importErrors: { value: any, reason: any }[] = [];

  listRoles: RoleType[] = [];

  readonly SUPER_ADMIN = 'superadmin';

idx: any;
item: any;
editEmail: any;

  constructor(@Inject(DOCUMENT) document: Document,
              private userService: UserService,
              private apiService: ApiService,
              public shared: SharedService,
              private fb: FormBuilder,
              public formBuilder: FormBuilder,
              private zone: NgZone,
              private router: Router) {
  }

  async ngOnInit() {
    this.getRoles().then(roles => {
      this.listRoles = roles;
      this.getUserForm();
    });

    this.userService.userDataChange.subscribe(user => {
      this.user = user;
      this.activeUser = this.user.user;
      this.loadUsers();
    })

    this.user = this.userService.userData;
    this.activeUser = this.user.user;
    this.loadUsers();

    await this.submitEditFormUser.arguments(this.users);
    this.loading= false;

  }

  
  async getUserForm() {
    // TODO: Validate if email exists
    this.validateForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
      userName: [null, [Validators.required]],
      userSurname: [null, [Validators.required]],
      roles: [null]
    });


  }

  async getRoles() {

    return Role.types();
  }

  loadUsers() {
    this.loading = true;
    this.apiService.getUsersWithRoles({
      where: {organization: this.activeUser.organization},
      page: this.page,
      perPage: this.perPage
    })
      .then(page => this.loadPage(page))
      .catch(err => console.log(err))
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
    this.users.forEach(async _user => {_user.rolesList = await _user.roles() })
    // console.log('Object.create(page.items)', page.items);
    this.updateEditCache(page.items, this.editCache);
  }

  assignEditCache(item: CacheItem, editItem: boolean = false, newItem: boolean = false) {
    return {
      editItem: editItem,
      newItem: newItem,
      data: item
    };
  }

  updateEditCache(listItems: any[], editCache: any[]) {
    editCache = [];
    listItems.forEach((item, index) => {
      editCache[index] = this.assignEditCache(item, editCache[index] ? editCache[index].editItem : false, false);
    });
    this.editCache = Object.create(editCache);
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
      password: password ? password : this.shared.generateRandomPassword()
    });

    return newUser.save();
  }


  updateUser(item: any): void {
    new User(item).update({email: item.email, name: item.name, surname: item.surname})
      .then((response: any) => {
        this.editCache[item.$id].edit = false;
        this.users = this.users.map(x => (x.id === item.id) ? response : x);
      })
     .catch( err => {
       console.error('ERROR: ', err);
     });
 }


  /*
  editUser(idx: number) {
    this.editCache[idx].editItem = true;
  }
  */ 

  async updateUserRoles(userItem: CacheItem) {
    const _rolesNames = userItem.data.roleNames;
    const _roles: Array<Role> = await userItem.data.roles();

    const _delList = _roles.filter(_role => {
      return !_rolesNames.includes(_role.name)
    })

    const _addList = _rolesNames.filter(_roleName => {
      const _rolesNameList = _roles.map(r => r.name);
      return !_rolesNameList.includes(_roleName)
    })

    _addList.forEach( _roleName => this.apiService.addUserRole(_roleName, userItem.data.id))
    _delList.forEach( _role => this.apiService.deleteUserRole(_role))
  }

  async saveUser(item: any) {
    this.loading = true;
    const usercache = this.editCache.find(f => f.data.id === item.id);
    if (!usercache.data.email) {
      this.loading = false;
      usercache.editItem = false;
      return;
    }

    this.updateUserRoles(usercache).finally();

    const body = {
      email: usercache.data.email,
      surname: usercache.data.surname || '-',
      name: usercache.data.name || '-',
    };

    const request = item.update(body);

    request
      .then(() => {
        this.loadUsers();
        usercache.editItem = false;
      })
      .finally(() => this.loading = false);
  }

  delUser(user: User) {
    var indice = this.users.findIndex( (element) => {return element.id == user.id;})
    this.users[indice].destroy();
    this.removeUserList(this.users[indice].id);
  }

  removeUserList(idx: number) {
    delete this.users[idx];
    delete this.editCache[idx];
    this.users = this.users.filter((value) => value !== this.users[idx]);
  }

/*
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
*/
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

  cleanImportErrors() {
    this.importErrors = [];
  }

  showModal() {
    this.showAddUser = true;
  }

  showModalDelete() {
    this.showMessageDelete = true;
  }

  closeModal() {
    this.shared.cleanForm(this.validateForm);
    this.showAddUser = false;
    this.showEditUser = false;
  }

  showModalEdit(modalEditUser: User) {
    this.usuarioOriginal = modalEditUser;
    this.usuarioEditar =  Object.assign(new User, modalEditUser);
    
    // TIENE QUE SER UNA LISTA DE ROLES 
    let rolesListEdit = this.usuarioEditar.roleNames;

    console.log(rolesListEdit);

    console.log(modalEditUser.id);
    this.showEditUser = true;
  }

/*
  email
  password
  nombre
  apellidos
  roles
    --Aceptar
*/
  submitEditFormUser(form: FormGroup) {
    
    const _email = (<HTMLInputElement>document.getElementById("edit_email")).value ;
    const _password = (<HTMLInputElement>document.getElementById("edit_password")).value;
    const _name =(<HTMLInputElement>document.getElementById("edit_name")).value;
    const _surname = (<HTMLInputElement>document.getElementById("edit_surname")).value;

    const updateData = {
      email: _email,
      password: _password, 
      name: _name,
      surname: _surname
    }
    const usercache = this.editCache.find(f => f.data.id === this.usuarioOriginal.id);

    const value = form.value;
    this.usuarioOriginal.update(updateData)
    .then(user => {
      if(value.roles){
        value.roles.forEach((rol: string) => {
        this.updateUserRoles(usercache).finally();
        this.usuarioOriginal.updateData;
        });
      }
      this.loadUsers();
      this.closeModal();
    });
  }

  submitFormUser(form: FormGroup) {
    this.shared.doFormDirty(form);
    if (form.valid) {
      const value = form.value;
      this.addUser(
        value.email,
        value.userName,
        value.userSurname,
        value.password)
        .then(user => {
          if(value.roles)
            value.roles.forEach((rol: string) => {
              this.apiService.addUserRole(rol, user.id).finally();
            });
          this.loadUsers();
          this.closeModal();
        });
    }
  }

  onBack() {
    this.router.navigate(['/control-panel']).finally();
  }

  onCheckedChange(idx: number) {
    if (this.listRoles[idx].name === this.SUPER_ADMIN) {
      for (const idxRol in this.listRoles) {
        if (this.listRoles.hasOwnProperty(idxRol)) {
          if (+idxRol !== idx) {
            this.shared.getFormControl(this.validateForm, 'roles', +idxRol).setValue(false);
          }
        }
      }
    } else {
      this.listRoles.forEach((rol, i) => {
        if (rol.name === this.SUPER_ADMIN) {
          this.shared.getFormControl(this.validateForm, 'roles', i).setValue(false);
        }
      });
    }
  }
  onRolesChanged(role: any, $event: string[]) {
    if ($event[$event.length - 1] === this.SUPER_ADMIN) {
      this.zone.run(() => {
        this.editCache[role].data.roleNames = [this.SUPER_ADMIN];
      });
    } else {
      this.editCache[role].data.roleNames = [... this.editCache[role].data.roleNames.filter(roleName => roleName !== this.SUPER_ADMIN)];
    }
  }

  isDissabled(idx: number, name: string) {
    let dissabled;
    if (name === this.SUPER_ADMIN) {
      dissabled = !(this.editCache[idx].data.rolesList.length === 0 || this.editCache[idx].data.rolesList.indexOf(name) > -1);
    } else {
      dissabled =  (this.editCache[idx].data.rolesList.indexOf(this.SUPER_ADMIN) > -1);
    }
    return dissabled;
  }
}

export interface CacheItem extends UserItem {
  data: any;
  editItem: boolean;
  newItem: boolean;
}

export interface editarUser {
  id: string;
  email: string;
  password: string;
  username: string;
  surname: string;
}

let userEditar : editarUser