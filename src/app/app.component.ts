import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {filter} from 'rxjs/operators';
import {NavigationEnd, Router} from '@angular/router';
import {SharedService} from './services/shared/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {

  language: string = 'es';

  constructor(private translate: TranslateService,
              private router: Router,
              private sharedService: SharedService) {
    this.initializeTranslate();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.sharedService.setPageChanged(event.url));
  }

  initializeTranslate() {
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.translate.getBrowserLang() || this.language);
  }
}
