import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserLogged } from '@app/models';
import { SharedService } from '@app/services/shared/shared.service';
import { UserService } from '@app/services/user/user.service';

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.less']
})
export class PersonalDataComponent implements OnInit {
  userData: UserLogged;
  validateForm: FormGroup;
  showEditPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public shared: SharedService
  ) { }

  ngOnInit(): void {
    this.getPasswordForm();
    this.getUserData();
  }

  getUserData(): void {
    this.userService.loadUserData().then(() => {
      this.userData = this.userService.userData;
    });
    console.log(this.userData);
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
