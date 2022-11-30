import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {NzButtonModule, NZ_I18N, es_ES, NzAlertModule, NzBreadCrumbModule, NzCardModule, NzDrawerModule, NzEmptyModule, NzFormModule, NzGridModule, NzIconModule, NzInputModule, NzLayoutModule, NzListModule, NzModalModule, NzPageHeaderModule, NzRateModule, NzSelectModule, NzSkeletonModule, NzStatisticModule, NzTableModule, NzTagModule, NzToolTipModule, NzBackTopModule, NzNotificationModule} from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEsExtra from '@angular/common/locales/extra/es';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {AuthInterceptor} from './interceptors/auth.interceptor';
import { LoginComponent } from '@components/login/login.component';
import {environment} from '../environments/environment';

import {POTION_CONFIG, POTION_RESOURCES, PotionModule} from '@openecoe/potion-client';

import {resources} from './app.resources';
import {PipesModule} from '@pipes/pipes.module';
import {BarRatingModule} from 'ngx-bar-rating';
import { CoreModule } from './core/core.module';
import { EcoeModule } from './modules/ecoe/ecoe.module';


registerLocaleData(localeEs, 'es', localeEsExtra);

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
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
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    PotionModule,
    PipesModule,
    EcoeModule,
    BarRatingModule,
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
    NzNotificationModule
  ],
  providers: [
    {
      provide: NZ_I18N,
      useValue: es_ES
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    /*{
      provide: HTTP_INTERCEPTORS,
      useClass: MessagesInterceptor,
      multi: true
    },*/
    {
      provide: POTION_CONFIG,
      useValue: {
        host: environment.API_ROUTE,
        prefix: '/api/v1'
      }
    },
    {
      provide: POTION_RESOURCES,
      useValue: resources,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
