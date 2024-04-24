import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadAndParseComponent } from './upload-and-parse/upload-and-parse.component';
import { ActionButtonsComponent } from './action-buttons/action-buttons.component';
import {NzAlertModule, NzBreadCrumbModule, NzButtonModule, NzCardModule, NzDividerModule, NzDrawerModule, NzEmptyModule, NzFormModule, NzGridModule, NzIconModule, NzInputModule, NzInputNumberModule, NzLayoutModule, NzListModule, NzMenuModule, NzModalModule, NzPageHeaderModule, NzPopconfirmModule, NzProgressModule, NzRadioGroupComponent, NzRadioModule, NzRateModule, NzSelectModule, NzSkeletonModule, NzStatisticModule, NzStepsModule, NzSwitchModule, NzTableModule, NzTagModule, NzToolTipModule, NzUploadModule, NzDropDownModule } from 'ng-zorro-antd';
import {TranslateModule} from '@ngx-translate/core';
import { MenuComponent } from './menu/menu.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {RouterModule} from '@angular/router';
import { QblockFormComponent } from './qblock-question-form/qblock-form/qblock-form.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { QuestionFormComponent } from './qblock-question-form/question-form/question-form.component';
import { OptionFormComponent } from './qblock-question-form/option-form/option-form.component';
import { QblockQuestionFormComponent } from './qblock-question-form/qblock-question-form.component';
import {QuestionsListComponent} from './questions-list/questions-list.component';
import {OptionsListComponent} from './questions-list/options/options-list/options-list.component';
import { ChronoComponent } from './chrono/chrono.component';
import {PipesModule} from '@pipes/pipes.module';
import { ProgressBarComponent } from './chrono/progress-bar/progress-bar.component';
import { ChronoHeaderComponent } from './chrono/chrono-header/chrono-header.component';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { ChangeOrganizationComponent } from './change-organization/change-organization/change-organization.component';

// TODO: Review to include Login and Home components
@NgModule({
  declarations: [
    UploadAndParseComponent,
    ActionButtonsComponent,
    MenuComponent,
    QblockFormComponent,
    QuestionFormComponent,
    OptionFormComponent,
    QblockQuestionFormComponent,
    QuestionsListComponent,
    OptionsListComponent,
    ChronoComponent,
    ProgressBarComponent,
    ChronoHeaderComponent,
    ChangeOrganizationComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    PipesModule,
    DragDropModule,
    ScrollingModule,
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
    NzSwitchModule,
    NzProgressModule,
    NzStepsModule,
    NzDividerModule,
    NzPopconfirmModule,
    NzUploadModule,
    NzMenuModule,
    NzInputNumberModule,
    NzSpaceModule,
    NzRadioModule,
    NzDropDownModule
  ],
  exports: [
    UploadAndParseComponent,
    ActionButtonsComponent,
    MenuComponent,
    QblockQuestionFormComponent,
    QuestionsListComponent,
    QuestionFormComponent,
    ChronoComponent,
    ChangeOrganizationComponent
  ]
})
export class ComponentsModule {}
