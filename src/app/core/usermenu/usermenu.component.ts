import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

@Component({
  selector: 'app-usermenu',
  templateUrl: './usermenu.component.html',
  styleUrls: ['./usermenu.component.less']
})
export class UsermenuComponent implements OnInit {

  constructor(private authService: AuthenticationService) { }

  ngOnInit() {
  }

}
