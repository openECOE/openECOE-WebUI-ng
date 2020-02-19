import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadAndParseComponent } from './upload-and-parse/upload-and-parse.component';
import { ActionButtonsComponent } from './action-buttons/action-buttons.component';
import {PapaParseModule} from 'ngx-papaparse';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {TranslateModule} from '@ngx-translate/core';
import { MenuComponent } from './menu/menu.component';
import {RouterModule} from '@angular/router';
import { QblockFormComponent } from './qblock-question-form/qblock-form/qblock-form.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { QuestionFormComponent } from './qblock-question-form/question-form/question-form.component';
import { OptionFormComponent } from './qblock-question-form/option-form/option-form.component';
import { QblockQuestionFormComponent } from './qblock-question-form/qblock-question-form.component';
import {QuestionsListComponent} from './questions-list/questions-list.component';
import {OptionsListComponent} from './questions-list/options/options-list/options-list.component';
import { ChronoComponent } from './chrono/chrono.component';
import {PipesModule} from '../pipes/pipes.module';
import { OptionsEvalComponent } from './questions-list/options/options-eval/options-eval.component';
import {BarRatingModule} from 'ngx-bar-rating';

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
    OptionsEvalComponent
  ],
  imports: [
    CommonModule,
    PapaParseModule,
    NgZorroAntdModule,
    TranslateModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    PipesModule,
    BarRatingModule
  ],
  exports: [
    UploadAndParseComponent,
    ActionButtonsComponent,
    MenuComponent,
    QblockQuestionFormComponent,
    QuestionsListComponent,
    QuestionFormComponent,
    ChronoComponent,
    OptionsListComponent,
    OptionsEvalComponent
  ]
})
export class ComponentsModule {}
