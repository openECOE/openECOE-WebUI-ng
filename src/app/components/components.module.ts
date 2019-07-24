import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadAndParseComponent } from './upload-and-parse/upload-and-parse.component';
import { ActionButtonsComponent } from './action-buttons/action-buttons.component';
import {PapaParseModule} from 'ngx-papaparse';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {TranslateModule} from '@ngx-translate/core';
import { MenuComponent } from './menu/menu.component';
import {RouterModule} from '@angular/router';
import { QblockFormComponent } from './qblock-form/qblock-form.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { QuestionFormComponent } from './question-form/question-form.component';
import { OptionFormComponent } from './option-form/option-form.component';

// TODO: Review to include Login and Home components
@NgModule({
  declarations: [
    UploadAndParseComponent,
    ActionButtonsComponent,
    MenuComponent,
    QblockFormComponent,
    QuestionFormComponent,
    OptionFormComponent
  ],
  imports: [
    CommonModule,
    PapaParseModule,
    NgZorroAntdModule,
    TranslateModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  exports: [
    UploadAndParseComponent,
    ActionButtonsComponent,
    MenuComponent,
    QblockFormComponent,
    QuestionFormComponent,
    OptionFormComponent
  ]
})
export class ComponentsModule {}
