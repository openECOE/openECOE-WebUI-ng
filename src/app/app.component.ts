import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {

  language: string = 'es';

  constructor(private translate: TranslateService) {
    this.initializeTranslate();
  }

  initializeTranslate() {
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.translate.getBrowserLang() || this.language);
  }
}
