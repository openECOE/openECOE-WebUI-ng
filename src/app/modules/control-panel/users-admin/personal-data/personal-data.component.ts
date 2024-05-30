import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserLogged } from '@app/models';
import { SharedService } from '@app/services/shared/shared.service';
import { UserService } from '@app/services/user/user.service';

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.less']
})
export class PersonalDataComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public shared: SharedService,
    private fb: FormBuilder
  ) { }

  userData: UserLogged;
  newPassword: string;
  validateForm: FormGroup;
  showEditPassword: boolean = false;
  confirmDeleteText: string = '';

  ngOnInit(): void {
    this.getPasswordForm();

    this.getUserData();
    
    this.validateForm.get('newPassword').valueChanges.subscribe(value => {
      this.confirmDeleteText = value;
    });
  }

  getUserData(): void {
    this.userService.loadUserData().then(() => {
      this.userData = this.userService.userData;
    });
    console.log(this.userData);
  }

  async getPasswordForm() {
    this.validateForm = this.fb.group({
      newPassword: [null,[Validators.required]],
    });
  }

  showModalEdit() {
    this.showEditPassword = true;
  }

  closeModal() {
    this.shared.cleanForm(this.validateForm);
    this.showEditPassword = false;
  }

  async submitFormOrganization(form: FormGroup) {
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
      //this.getUserData();
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
