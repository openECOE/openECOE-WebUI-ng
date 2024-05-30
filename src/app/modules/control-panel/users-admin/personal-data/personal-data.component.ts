import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserLogged } from '@app/models';
import { UserService } from '@app/services/user/user.service';

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.less']
})
export class PersonalDataComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService
  ) { }

  userData: UserLogged; 

  ngOnInit(): void {
    this.getUserData();
  }

  getUserData(): void {
    this.userService.loadUserData().then(() => {
      this.userData = this.userService.userData;
    });
    console.log(this.userData);
  }

  editUser() {
  }

}
