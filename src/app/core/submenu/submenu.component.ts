import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

@Component({
  selector: 'app-submenu',
  templateUrl: './submenu.component.html',
  styleUrls: ['./submenu.component.less']
})
export class SubmenuComponent implements OnInit {

  @Input() private submenuSelected: string;
  @Input() private ecoeId: number;

  submenu2build = [];


  constructor(private translate: TranslateService, private router: Router, private authService: AuthenticationService) { }

  ngOnInit() {
    const submenus = {
      ECOE: [
        { title: this.translate.instant('CONFIGURATION'), redirecTo: '/ecoe/admin' },
        { title: this.translate.instant('EVALUATION'), redirecTo: '/ecoe/evaluate' },
        { title: this.translate.instant('SCHEDULE'), redirectTo: '/ecoe/chrono' }
      ]
    };

    this.submenu2build = submenus[this.submenuSelected];
  }

}
