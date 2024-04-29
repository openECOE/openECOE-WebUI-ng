import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadAndParseComponent } from './upload-and-parse/upload-and-parse.component';
import { ActionButtonsComponent } from './action-buttons/action-buttons.component';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzRadioGroupComponent, NzRadioModule } from 'ng-zorro-antd/radio';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';

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
