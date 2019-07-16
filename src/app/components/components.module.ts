import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadAndParseComponent } from './upload-and-parse/upload-and-parse.component';
import { ActionButtonsComponent } from './action-buttons/action-buttons.component';
import {PapaParseModule} from 'ngx-papaparse';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {TranslateModule} from '@ngx-translate/core';
import { MenuComponent } from './menu/menu.component';
import {RouterModule} from '@angular/router';

// TODO: Review to include Login and Home components
@NgModule({
  declarations: [
    UploadAndParseComponent,
    ActionButtonsComponent,
    MenuComponent
  ],
  imports: [
    CommonModule,
    PapaParseModule,
    NgZorroAntdModule,
    TranslateModule,
    RouterModule
  ],
  exports: [
    UploadAndParseComponent,
    ActionButtonsComponent,
    MenuComponent
  ]
})
export class ComponentsModule {}
