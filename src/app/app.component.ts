import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {filter} from 'rxjs/operators';
import {NavigationEnd, Router} from '@angular/router';
import {SharedService} from './services/shared/shared.service';
import {AuthenticationService} from './services/authentication/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {

  language: string = 'es';

  constructor(private translate: TranslateService,
              public router: Router,
              private sharedService: SharedService,
              public authService: AuthenticationService) {
    this.initializeTranslate();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.sharedService.setPageChanged(event.url));

    if (this.authService.userLogged) {
      this.authService.loadUserData();
    }
  }

  /**
   * Initializes the browser language.
   */
  initializeTranslate() {
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.translate.getBrowserLang() || this.language);
  }
}
