import { Component, OnInit, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { UserLogged } from '@app/models';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { UserService } from '@app/services/user/user.service';
import { NzContextMenuService } from 'ng-zorro-antd';

@Component({
  selector: 'app-usermenu',
  templateUrl: './usermenu.component.html',
  styleUrls: ['./usermenu.component.less']
})
export class UsermenuComponent implements OnInit {

  userData: UserLogged;

  constructor(
    private userService: UserService, 
    public auth: AuthenticationService,
    private router: Router) {
    this.userService.userDataChange.subscribe(user => {
      this.userData = user;
    })  
  }

  ngOnInit() {
  }

  logout(){
    this.auth.logout();
  }

  goTo(route: string){
    this.router.navigate([route])
  }

}
