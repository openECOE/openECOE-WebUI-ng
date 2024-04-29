import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from "@angular/common/http";
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NZ_I18N, es_ES } from 'ng-zorro-antd/i18n';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzNotificationModule } from 'ng-zorro-antd/notification';

import { registerLocaleData } from "@angular/common";
import localeEs from "@angular/common/locales/es";
import localeEsExtra from "@angular/common/locales/extra/es";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { AuthInterceptor } from "./interceptors/auth.interceptor";
import { LoginComponent } from "@components/login/login.component";
import { environment } from "../environments/environment";

import {
  POTION_CONFIG,
  POTION_RESOURCES,
  PotionModule,
} from "@openecoe/potion-client";

import { resources } from "./app.resources";
import { PipesModule } from "@pipes/pipes.module";
import { CoreModule } from "./core/core.module";
import { EcoeModule } from "./modules/ecoe/ecoe.module";
import { GenerateReportsComponent } from "./modules/ecoe-results/generate-reports/generate-reports.component";
import { RouterModule } from "@angular/router";
import { EcoeResultsComponent } from "./modules/ecoe-results/ecoe-results.component";
import { NzProgressModule } from "ng-zorro-antd/progress";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { GradesComponent } from "./modules/ecoe-results/grades/grades.component";
import { EvaluationItemsComponent } from './modules/ecoe-results/evaluation-items/evaluation-items.component';

registerLocaleData(localeEs, "es", localeEsExtra);

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    GenerateReportsComponent,
    EcoeResultsComponent,
    GradesComponent,
    EvaluationItemsComponent,
  ],
  imports: [
    CoreModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NzButtonModule,
    NzProgressModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    PotionModule,
    PipesModule,
    EcoeModule,
    NzBreadCrumbModule,
    NzGridModule,
    NzInputModule,
    NzFormModule,
    NzModalModule,
    NzSelectModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzTableModule,
    NzAlertModule,
    NzDrawerModule,
    NzStatisticModule,
    NzCardModule,
    NzSkeletonModule,
    NzToolTipModule,
    NzPageHeaderModule,
    NzLayoutModule,
    NzEmptyModule,
    NzListModule,
    NzRateModule,
    NzBackTopModule,
    NzNotificationModule,
    RouterModule,
    NzSpinModule,
  ],
  providers: [
    {
      provide: NZ_I18N,
      useValue: es_ES,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: POTION_CONFIG,
      useValue: {
        host: environment.BACK_ROUTE,
        prefix: "/backend/api/v1",
      },
    },
    {
      provide: POTION_RESOURCES,
      useValue: resources,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
