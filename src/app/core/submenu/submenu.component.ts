
import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { NavigationEnd, Router} from '@angular/router';
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

constructor(private translate: TranslateService,
            private router: Router,
            public location: Location,
            public authService: AuthenticationService) { }

  ngOnInit() {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd ))
    .subscribe((val: NavigationEnd) => {
      this.ecoeId = +val.urlAfterRedirects.split('/')[2];
      const activeLink = val.urlAfterRedirects.split('/')[3];

      const submenus = {
        ECOE: [
          { title: 'CONFIGURATION', redirecTo: `/ecoe/${this.ecoeId}/admin`, active: activeLink === 'admin' },
          { title: 'EVALUATION', redirecTo: `/ecoe/${this.ecoeId}/eval`, active: activeLink === 'eval' },
          { title: 'SCHEDULE', redirectTo: `/ecoe/${this.ecoeId}/chrono`, active: activeLink === 'chrono' }
        ]
      };

      this.submenu2build = submenus[this.submenuSelected];
    });
  }

}
