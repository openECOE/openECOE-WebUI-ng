import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { AuthenticationService } from '@services/authentication/authentication.service';
import { NavigationEnd, Router } from '@angular/router';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-submenu',
  templateUrl: './submenu.component.html',
  styleUrls: ['./submenu.component.less']
})
export class SubmenuComponent implements OnInit {

  @Input() submenuSelected: string;

  ecoeId: number;
  submenu2build = [];

  constructor(
    private translate: TranslateService,
    private router: Router,
    public location: Location,
    public authService: AuthenticationService) { }

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd ))
      .subscribe((val: NavigationEnd) => {
        this.ecoeId = +val.urlAfterRedirects.split('/')[2];
        const activeLink = val.urlAfterRedirects.split('/')[3];

        const _userData = this.authService.userData;

        if (_userData) {
          const isEval = _userData.roles.includes('evaluator');
          const isAdmin = _userData.roles.includes('administrator');

          const submenus = {
            ECOE: [
              {
                title: 'CONFIGURATION',
                redirecTo: `/ecoe/${this.ecoeId}/admin`,
                active: activeLink === 'admin',
                show: isAdmin,
              },
              {
                title: 'EVALUATION',
                redirecTo: `/ecoe/${this.ecoeId}/eval`,
                active: activeLink === 'eval',
                show: isEval || isAdmin,
              },
              {
                title: 'SCHEDULE',
                redirecTo: `/ecoe/${this.ecoeId}/chrono`,
                active: activeLink === 'chrono',
                show: isAdmin,
              },
            ],
          };

          submenus.ECOE = submenus.ECOE.filter(s => s.show);

          this.submenu2build = submenus[this.submenuSelected];
          // this.submenu2build = submenus[this.submenuSelected];
        }
      });
  }


}
