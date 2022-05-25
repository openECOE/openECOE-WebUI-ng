import { Component, OnInit, Injector } from '@angular/core';
import { UserLogged } from '@app/models';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { UserService } from '@app/services/user/user.service';

@Component({
  selector: 'app-usermenu',
  templateUrl: './usermenu.component.html',
  styleUrls: ['./usermenu.component.less']
})
export class UsermenuComponent implements OnInit {

  userData: UserLogged;

  constructor(private userService: UserService, private auth: AuthenticationService) {
    this.userService.userDataChange.subscribe(user => {
      this.userData = user;
    })  
  }

  ngOnInit() {
  }

  logout(){
    this.auth.logout();
  }

}
