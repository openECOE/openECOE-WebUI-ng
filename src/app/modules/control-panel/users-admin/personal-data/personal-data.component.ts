import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User, UserLogged } from '@app/models';
import { SharedService } from '@app/services/shared/shared.service';
import { UserService } from '@app/services/user/user.service';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.less']
})
export class PersonalDataComponent implements OnInit, OnDestroy {
  userData: UserLogged;
  validateForm: FormGroup;
  showEditPassword: boolean = false;
  editUserName: boolean = false;
  editUserSurname: boolean = false;
  editedName: string;
  editedSurname: string;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public shared: SharedService,
    private message: NzMessageService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.getPasswordForm();
    if(this.userService.userData) {
      this.userData = this.userService.userData;
    } else {
      this.getUserData();
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  startEdit(user: User, option: number): void {
    switch (option) {
      case 1:
        this.editUserName = true;
        break;
      case 2:
        this.editUserSurname = true;
        break;
    }
  } 
  
  updateItem(item: any, option:number): void {
    if (!this.editedName || !this.editedSurname) {
      return;
    }
    switch (option) {
      case 1:
        const bodyName = {
          name: this.editedName,
        };
      
        const requestName = item.user.update(bodyName);
    
        requestName.then(response => {
          this.userData.user = response;
          this.editUserName = false;
        }).catch((err) => {
          this.message.create('error', this.translate.instant('EDIT_PERSONAL_DATA_ERROR'));
        });
        break;
      case 2:
        const bodySurname = {
          surname: this.editedSurname,
        };
      
        const requestSurname = item.user.update(bodySurname);
    
        requestSurname.then(response => {
          this.userData.user = response;
          this.editUserSurname = false;
        }).catch((err) => {
          this.message.create('error', this.translate.instant('EDIT_PERSONAL_DATA_ERROR'));
        });
        break;
    }
  }
  
  cancelEdit(option: number): void {
    switch (option) {
      case 1:
        this.editUserName = false;
        break;
      case 2:
        this.editUserSurname = false;
        break;
    }
  }

  getUserData(): void {
    this.userService.userDataChange.pipe(takeUntil(this.destroyed$)).subscribe((user: UserLogged) => {
      this.userData = user;
      this.editedName = this.userData.user.name;
      this.editedSurname = this.userData.user.surname;
    });
  }
  
  getPasswordForm() {
    this.validateForm = this.fb.group({
      newPassword: [null, [Validators.required, Validators.minLength(8)]],
      newPasswordRepeat: [
        null,
        [Validators.required, this.confirmationValidator]
      ]
    });
  }

  //Validator to ckeck if password and confirm password are the same
  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (
      control.value &&
      control.value !== this.validateForm.controls.newPassword.value
    ) {
      return { confirm: true, error: true };
    }
    return {};
  };

  showModalEdit() {
    this.showEditPassword = true;
  }

  closeModal() {
    this.shared.cleanForm(this.validateForm);
    this.showEditPassword = false;
  }

  async submitFormPassword(form: FormGroup) {
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
      if (this.showEditPassword) {
        await this.updatePassword(this.userData, value);
      }
    } catch (error) {
      console.error(error);
    }
    this.closeModal();
  }

  async updatePassword(userData: UserLogged, value: any) {
    const updateData = {
      password: value.newPassword,
    };
    
    await userData.user.update(updateData);
  }
}
