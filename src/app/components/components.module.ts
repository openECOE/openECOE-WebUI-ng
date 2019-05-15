import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadAndParseComponent } from './upload-and-parse/upload-and-parse.component';
import { ActionButtonsComponent } from './action-buttons/action-buttons.component';
import {PapaParseModule} from 'ngx-papaparse';
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {TranslateModule} from '@ngx-translate/core';

// TODO: Review to include Login and Home components
@NgModule({
  declarations: [
    UploadAndParseComponent,
    ActionButtonsComponent
  ],
  imports: [
    CommonModule,
    PapaParseModule,
    NgZorroAntdModule,
    TranslateModule
  ],
  exports: [
    UploadAndParseComponent,
    ActionButtonsComponent
  ]
})
export class ComponentsModule {}
