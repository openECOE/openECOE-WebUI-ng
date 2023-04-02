import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {EvaluationRoutingModule} from './evaluation-routing.module';
import {TranslateModule} from '@ngx-translate/core';
import {EvaluationDetailsComponent} from './evaluation-details/evaluation-details.component';
import {FormsModule} from '@angular/forms';
import {PipesModule} from '@pipes/pipes.module';
import {EvaluateComponent} from './evaluate/evaluate.component';
import {ComponentsModule} from '@components/components.module';
import {QuestionComponent} from './question/question.component';
import {QuestionRadioComponent} from './question/question-radio/question-radio.component';
import {QuestionCheckboxComponent} from './question/question-checkbox/question-checkbox.component';
import {QuestionRangeComponent} from './question/question-range/question-range.component';
import {
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
  NzRadioModule,
  NzSpinModule,
  NzDividerModule,
  NzStepsModule,
  NzMessageModule
} from "ng-zorro-antd";

@NgModule({
  imports: [
    CommonModule,
    EvaluationRoutingModule,
    TranslateModule,
    FormsModule,
    PipesModule,
    ComponentsModule,
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
    NzRadioModule,
    NzSpinModule,
    NzDividerModule,
    NzStepsModule,
    NzMessageModule
  ],
  exports: [
    QuestionComponent
  ],
  declarations: [
    EvaluationDetailsComponent,
    EvaluateComponent,
    QuestionComponent,
    QuestionRadioComponent,
    QuestionCheckboxComponent,
    QuestionRangeComponent]
})
export class EvaluationModule {
}
