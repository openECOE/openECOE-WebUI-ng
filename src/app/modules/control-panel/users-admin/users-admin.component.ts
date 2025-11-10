import {Component, EventEmitter, Inject, inject, Input, NgZone, OnInit, Output} from '@angular/core';
import {Role, RoleType, User, UserLogged} from '@app/models';
import {SharedService} from '@services/shared/shared.service';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import {ApiService} from '@services/api/api.service';
import { DOCUMENT } from '@angular/common';
import { UserService } from '@app/services/user/user.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

import { findLast } from '@angular/compiler/src/directive_resolver';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Observer } from 'rxjs';
import { ParserFile } from '@app/components/upload-and-parse/upload-and-parse.component';
import { Item } from '@openecoe/potion-client';


interface UserItem extends User {
  rolesList: Array<Role>;
  checked: boolean;
}

@Component({
  selector: "app-users-admin",
  templateUrl: "./users-admin.component.html",
  styleUrls: ["./users-admin.component.less"],
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
  usuarioEditar: User;
  usuarioOriginal: User;

  validateForm: FormGroup;
  showAddUser: boolean = false;
  showMessageDelete: boolean = false;
  showEditUser: boolean = false;
  importErrors: { value: any; reason: any }[] = [];

  listRoles: RoleType[] = [];

  readonly SUPER_ADMIN = "superadmin";

  idx: any;
  item: any;
  editEmail: any;

  usersParser: ParserFile = {
    "filename": "users.csv",
    "fields": ["email", "password", "userName", "userSurname", "roles"], 
    "data": ["email@email.es", "password", "name", "surname", "administrator,user,evaluator"]
  };

  constructor(
    private userService: UserService,
    private apiService: ApiService,
    public shared: SharedService,
    private fb: FormBuilder,
    public formBuilder: FormBuilder,
    private message: NzMessageService,
    private zone: NgZone,
    private router: Router,
    private translate: TranslateService,
    private modalService: NzModalService,
  ) {}

  async ngOnInit() {
    this.listRoles = await this.getRoles();
    this.userService.userDataChange.subscribe((user) => {
      this.user = user;
      this.activeUser = this.user.user;
      this.loadUsers();
      this.getUserForm();
      this.loadUsers();
    });

    this.user = this.userService.userData;
    this.activeUser = this.user.user;
    this.getUserForm();
    this.loadUsers();
    this.FilteredRolesByUsers();
  }

 // Filter roles by user
  filteredRoles: RoleType[] = [];
 superadmin: boolean = false;
 FilteredRolesByUsers() {
  if(this.user.isSuper)
  {
    this.filteredRoles = this.listRoles;
    this.superadmin = true;
  }
  else if(this.user.isAdmin)
  {
    this.filteredRoles = this.listRoles.filter((role) => role.name !== 'superadmin');
  }
  else if(this.user.isEval)
  {
    this.filteredRoles = this.listRoles.filter((role) => role.name !== 'superadmin' && role.name !== 'administrator' && role.name !== 'evaluator');
  }
  else
  {
    this.filteredRoles = [];
  }
 }

  async getUserForm() {
    // TODO: Validate if email exists
    this.validateForm = this.fb.group({
      email: [
        null,
        [Validators.required, Validators.email],
        [this.userEmailAsyncValidator],
      ],
      password: [null, [this.requiredWhenAddingUser, Validators.minLength(8)]],
      checkPassword: [
        null,
        [this.requiredWhenAddingUser, this.confirmationValidator],
      ],
      userName: [null, [Validators.required]],
      userSurname: [null, [Validators.required]],
      roles: [null],
    });
  }

  //CUstom Validator to make required only when adding a new user
  requiredWhenAddingUser = (control: FormControl) => {
    if (this.showAddUser) {
      return Validators.required(control);
    } else {
      return null;
    }
  };
  // activar/desactivar el editor de usuarios

  Roles(item: any, roleName: string): boolean
  {
  return item.rolesList?.some(role => role.name === roleName);
  }

  //Validator to check if email exists, and wait a time to check it
  userEmailAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const _email = control.value;
      // If showAddUser is true, we are adding a new user, so we have to check if email exists
      // otherwise, we are editing a user, so we have to check if email exists, but not for the user we are editing
      if (this.showAddUser || this.usuarioOriginal.email !== _email) {
        setTimeout(async () => {
          const _user = await User.first({ where: { email: _email } });

          if (_user) {
            // you have to return `{error: true}` to mark it as an error event
            observer.next({ error: true, duplicated: true });
          } else {
            observer.next(null);
          }
          observer.complete();
        }, 1000);
      } else {
        observer.next(null);
        observer.complete();
      }
    });

  //Validator to ckeck if password and confirm password are the same
  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (
      control.value &&
      control.value !== this.validateForm.controls.password.value
    ) {
      return { confirm: true, error: true };
    }
    return {};
  };

  async getRoles() {
    return Role.types();
  }

  loadUsers() {
    this.loading = true;
    this.apiService
      .getUsersWithRoles({
        where: { organization: this.activeUser.organization },
        page: this.page,
        perPage: this.perPage,
      })
      .then((page) => {
        this.loadPage(page)
  })
      .catch((err) => console.log(err))
      .finally(() => (this.loading = false));
  }

  pageChange(page: number) {
    this.loading = true;
    this.page = page;
    this.usersPage
      .changePageTo(page)
      .then((retPage) => this.loadPage(retPage))
      .finally(() => (this.loading = false));
  }

  pageSizeChange(pageSize: number) {
    this.perPage = pageSize;
    this.loadUsers();
  }

  async loadPage(page: any) {
    this.usersPage = page;
    this.totalItems = this.usersPage.total;
    const _users: Array<UserItem> = [...this.usersPage.items];
    
    for (const user of _users) {
      user.rolesList = await user.roles();
      user.checked = false;
    }
    // console.log('Object.create(page.items)', page.items);
    this.updateEditCache(page.items, this.editCache);
    this.users = _users;
  }

  assignEditCache(
    item: CacheItem,
    editItem: boolean = false,
    newItem: boolean = false
  ) {
    return {
      editItem: editItem,
      newItem: newItem,
      data: item,
    };
  }

  updateEditCache(listItems: any[], editCache: any[]) {
    editCache = [];
    listItems.forEach((item, index) => {
      editCache[index] = this.assignEditCache(
        item,
        editCache[index] ? editCache[index].editItem : false,
        false
      );
    });
    this.editCache = Object.create(editCache);
  }

  async addUser(
    email: string = "",
    name: string = "",
    surname: string = "",
    password: string = null,
    roles: Array<string> = [],
    batch: boolean = false
  ): Promise<User> {
    try {
      const newUser = new User({
        email: email,
        name: name,
        surname: surname,
        organization: this.activeUser.organization,
        password: password ? password : this.shared.generateRandomPassword(),
      });

      const _user = await newUser.save();

      for (const rol of roles) {
        await this.apiService.addUserRole(rol.trim(), _user.id);
      }

      if (!batch) {
        this.message.success(
          this.translate.instant("USER_CREATED", { email: _user.email })
        );
      }
      
      return _user;
    } catch (error) {
      console.log(error);
      this.message.error(this.translate.instant("ERROR_CREATE_USER"));
      //raise error to stop batch creation
      throw error;
    }
  }

  async updateUser(user: User, value: any) {
    const updateData = {
      email: value.email,
      name: value.userName,
      surname: value.userSurname,
    };

    if (value.password) {
      updateData["password"] = value.password;
    }
    await user.update(updateData);
    await this.updateUserRoles(user, value.roles);

    this.message.success(
      this.translate.instant("USER_UPDATED", { email: user.email })
    );
  }

  async updateUserRoles(user: User, newRoles: Array<string>) {
    const _rolesNames = newRoles;
    const _roles: Array<Role> = await user.roles();

    const _delList = _roles.filter((_role) => {
      return !_rolesNames.includes(_role.name);
    });

    const _addList = _rolesNames.filter((_roleName) => {
      const _rolesNameList = _roles.map((r) => r.name);
      return !_rolesNameList.includes(_roleName);
    });

    _addList.forEach((_roleName) =>
      this.apiService.addUserRole(_roleName, user.id)
    );
    _delList.forEach((_role) => this.apiService.deleteUserRole(_role));
  }

  async saveUser(item: any) {
    this.loading = true;
    const usercache = this.editCache.find((f) => f.data.id === item.id);
    if (!usercache.data.email) {
      this.loading = false;
      usercache.editItem = false;
      return;
    }

    const body = {
      email: usercache.data.email,
      surname: usercache.data.surname || "-",
      name: usercache.data.name || "-",
    };

    const request = item.update(body);

    request
      .then(() => {
        this.loadUsers();
        usercache.editItem = false;
      })
      .finally(() => (this.loading = false));
  }

  async delUser(user: User, batch: boolean = false) {
    try {
      await user.destroy();
      
      if (!batch) {
        this.message.success(
          this.translate.instant("USER_DELETED", { email: user.email })
        );
      }

      this.loadUsers();
    } catch (error) {
      this.message.error(this.translate.instant("ERROR_DELETE_USER"));
    }
  }

  delUsers(users: Array<User>) {
    const _delPromises = [];

    for (const user of users) {
      _delPromises.push(this.delUser(user, true));
    }

    Promise.all(_delPromises)
    .then(() => {
      this.message.success(this.translate.instant("USERS_DELETED"));
    })
    .finally(() => this.loadUsers());
  }

  delSelected() {
    const _delUsers = this.users.filter((u) => u.checked);
    
    if (_delUsers.length === 0) {
      this.message.warning(this.translate.instant("NO_USERS_SELECTED"));
      return;
    } else {
      this.modalService.confirm({
        nzTitle: this.translate.instant("DELETE_USER"),
        nzContent: this.translate.instant("DELETE_USER_CONFIRM"),
        nzOkText: this.translate.instant("DELETE"),
        nzOkType: "danger",
        nzOnOk: () => {
          this.delUsers(_delUsers);
        },
        nzCancelText: this.translate.instant("CANCEL"),
      });
      return;
    }
  }  

  importUsers(parserResult: Array<any>) {
    this.importErrors = [];
    const respPromises = [];

    for (const value of parserResult) {
      let roles = [];
      if (value.roles) {
         roles = value.roles.split(",");
         roles = roles.map((r) => r.trim());
      }
      //Check all values are present
      if (!value.email || !value.userName || !value.userSurname) {
        continue; //skip this user        
      }

      const promise = this.addUser(
        value.email.toString(),
        value.userName.toString(),
        value.userSurname.toString(),
        value.password.toString(),
        roles,
        true
      )
        .then((resp) => {
          console.log("User import", resp.email, resp);
          return resp;
        })
        .catch((reason) => {
          console.warn("User import error", value, reason);
          this.importErrors.push({
            value: value,
            reason: reason,
          });
          return reason;
        });

      respPromises.push(promise);
    };

    Promise.all(respPromises)
    .finally(() => {
      this.loadUsers()
    });
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

  async showModalEdit(modalEditUser: User) {
    this.usuarioOriginal = modalEditUser;

    this.validateForm.controls["email"].setValue(modalEditUser.email);
    this.validateForm.controls["userName"].setValue(modalEditUser.name);
    this.validateForm.controls["userSurname"].setValue(modalEditUser.surname);

    const _roles = await modalEditUser.roles();

    let roles = [];
    for (const rol of _roles) {
      roles.push(rol.name);
    }

    this.validateForm.controls["roles"].setValue(roles);

    this.showEditUser = true;
  }

  async submitFormUser(form: FormGroup) {
    this.shared.doFormDirty(form);
    if (form.pending) {
      const sub = form.statusChanges.subscribe(() => {
        if (form.valid) {
          this.submitForm(form.value);
        }
        sub.unsubscribe();
      });
    } else if (form.valid) {
      this.submitForm(form.value);
    }
  }

  async submitForm(value: any) {
    try {
      if (this.showAddUser) {
        await this.addUser(
          value.email,
          value.userName,
          value.userSurname,
          value.password,
          value.roles
        );
      } else if (this.showEditUser) {
        await this.updateUser(this.usuarioOriginal, value);
      }

      this.loadUsers();
    } catch (error) {
      console.error(error);
      this.message.create(
        "error",
        "Error al guardar la información del usuario"
      );
    }
    this.closeModal();
  }

  onCheckedChange(idx: number) {
    if (this.listRoles[idx].name === this.SUPER_ADMIN) {
      for (const idxRol in this.listRoles) {
        if (this.listRoles.hasOwnProperty(idxRol)) {
          if (+idxRol !== idx) {
            this.shared
              .getFormControl(this.validateForm, "roles", +idxRol)
              .setValue(false);
          }
        }
      }
    } else {
      this.listRoles.forEach((rol, i) => {
        if (rol.name === this.SUPER_ADMIN) {
          this.shared
            .getFormControl(this.validateForm, "roles", i)
            .setValue(false);
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
      this.editCache[role].data.roleNames = [
        ...this.editCache[role].data.roleNames.filter(
          (roleName) => roleName !== this.SUPER_ADMIN
        ),
      ];
    }
  }

  isDissabled(idx: number, name: string) {
    let dissabled;
    if (name === this.SUPER_ADMIN) {
      dissabled = !(
        this.editCache[idx].data.rolesList.length === 0 ||
        this.editCache[idx].data.rolesList.indexOf(name) > -1
      );
    } else {
      dissabled =
        this.editCache[idx].data.rolesList.indexOf(this.SUPER_ADMIN) > -1;
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

