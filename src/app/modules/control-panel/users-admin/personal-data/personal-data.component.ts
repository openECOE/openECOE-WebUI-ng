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
  editLanguageDefault: boolean = false;
  editedName: string;
  editedSurname: string;
  editedLanguageDefault: string;

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
      case 3:
        this.editLanguageDefault = true;
        break;
    }
  } 
  
  updateItem(item: any, option:number): void {
    console.log('entra en update item?');
    console.log('[updateItem] called', { option, editedName: this.editedName, editedSurname: this.editedSurname, editedLanguageDefault: this.editedLanguageDefault, item });
    if (!this.editedName || !this.editedSurname || !this.editedLanguageDefault) {
      console.log('entra en el el if?');
      
      return;
    }
    switch (option) {
      case 1:
        console.log('[updateItem] entering case 1');
        const bodyName = { name: this.editedName };
      
        const requestName = item?.user?.update?.(bodyName);
        if (!requestName) {
          console.error('[updateItem] item.user.update is not a function', { item });
          this.message.error('No se puede actualizar: método update no encontrado.');
          return;
        }
        requestName
          .then(response => {
            console.log('[updateItem] response case 1:', response);
            this.userData.user = response;
            this.editUserName = false;
            this.message.success(this.translate.instant('EDIT_PERSONAL_DATA_SUCCESS'));
          })
          .catch(err => {
            console.error('[updateItem] error case 1:', err);
            this.message.error(this.translate.instant('EDIT_PERSONAL_DATA_ERROR'));
          });
        break;

      case 2:
        console.log('[updateItem] entering case 2');
        const bodySurname = { surname: this.editedSurname };
        const requestSurname = item?.user?.update?.(bodySurname);
        
        if (!requestSurname) {
          console.error('[updateItem] item.user.update is not a function', { item });
          this.message.error('No se puede actualizar: método update no encontrado.');
          return;
        }
        requestSurname
          .then(response => {
            console.log('[updateItem] response case 2:', response);
            this.userData.user = response;
            this.editUserSurname = false;
            this.message.success(this.translate.instant('EDIT_PERSONAL_DATA_SUCCESS'));
          })
          .catch(err => {
            console.error('[updateItem] error case 2:', err);
            this.message.error(this.translate.instant('EDIT_PERSONAL_DATA_ERROR'));
          });
        break;
        
      case 3:
        console.log('[updateItem] entering case 3');
        const bodyLanguage = { language: this.editedLanguageDefault };      
        const requestLanguage = item?.user?.update?.(bodyLanguage);
          
        if (!requestLanguage) {
          console.error('[updateItem] item.user.update is not a function', { item });
          this.message.error('No se puede actualizar: método update no encontrado.');
          return;
        }
        requestLanguage
          .then(response => {
            console.log('[updateItem] response case 3:', response);
            this.userData.user = response;
            this.editLanguageDefault = false;
            this.message.success(this.translate.instant('EDIT_PERSONAL_DATA_SUCCESS'));
          })
          .catch(err => {
            console.error('[updateItem] error case 2:', err);
            this.message.error(this.translate.instant('EDIT_PERSONAL_DATA_ERROR'));
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
      case 3:
        this.editLanguageDefault = false;
        break;
    }
  }

  getUserData(): void {
    this.userService.userDataChange.pipe(takeUntil(this.destroyed$)).subscribe((user: UserLogged) => {
      this.userData = user;
      this.editedName = this.userData.user.name;
      this.editedSurname = this.userData.user.surname;
      //this.editedLanguageDefault = this.userData.user.language;
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