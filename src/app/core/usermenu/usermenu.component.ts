import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '@services/authentication/authentication.service';

@Component({
  selector: 'app-usermenu',
  templateUrl: './usermenu.component.html',
  styleUrls: ['./usermenu.component.less']
})
export class UsermenuComponent implements OnInit {

  constructor(public authService: AuthenticationService) { }

  ngOnInit() {
  }

  logout(){
    this.authService.logout();
    window.location.reload();
  }

}
