import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {NgZorroAntdModule, NZ_I18N, es_ES, NZ_MESSAGE_CONFIG} from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEsExtra from '@angular/common/locales/extra/es';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {AuthInterceptor} from './interceptors/auth.interceptor';
import { HomeComponent } from './modules/admin-ecoe/home/home.component';
import { LoginComponent } from './components/login/login.component';
import {environment} from '../environments/environment';

import {POTION_CONFIG, POTION_RESOURCES, PotionModule} from '@openecoe/potion-client';

import {resources} from './app.resources';
import {PipesModule} from './pipes/pipes.module';
import { CoreModule } from './core/core.module';


registerLocaleData(localeEs, 'es', localeEsExtra);

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
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
    NgZorroAntdModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    PotionModule,
    PipesModule
  ],
  providers: [
    {
      provide: NZ_I18N,
      useValue: es_ES
    },
    {
      provide: NZ_MESSAGE_CONFIG,
      useValue: {
        nzMaxStack: 1,
      }
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
