import { Component, OnInit } from '@angular/core';
import { UserLogged } from '@app/models';
import {AuthenticationService} from '@services/authentication/authentication.service';

@Component({
  selector: 'app-usermenu',
  templateUrl: './usermenu.component.html',
  styleUrls: ['./usermenu.component.less']
})
export class UsermenuComponent implements OnInit {

  userData: UserLogged;

  constructor(public authService: AuthenticationService) {
    this.userData = this.authService.userData
   }

  ngOnInit() {
    
  }

  logout(){
    this.authService.logout();
  }

}
