import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {EvaluationRoutingModule} from './evaluation-routing.module';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {TranslateModule} from '@ngx-translate/core';
import {EvaluationDetailsComponent} from './evaluation-details/evaluation-details.component';
import {FormsModule} from '@angular/forms';
import {PipesModule} from '../../pipes/pipes.module';
import {EvaluateComponent} from './evaluate/evaluate.component';
import {ComponentsModule} from '../../components/components.module';
import {QuestionComponent} from './question/question.component';
import {QuestionRadioComponent} from './question/question-radio/question-radio.component';
import {QuestionCheckboxComponent} from './question/question-checkbox/question-checkbox.component';
import {QuestionRangeComponent} from './question/question-range/question-range.component';
import {QuestionBaseComponent} from './question/question-base/question-base.component';

@NgModule({
  imports: [
    CommonModule,
    EvaluationRoutingModule,
    NgZorroAntdModule,
    TranslateModule,
    FormsModule,
    PipesModule,
    ComponentsModule,
  ],
  declarations: [
    EvaluationDetailsComponent,
    EvaluateComponent,
    QuestionComponent,
    QuestionRadioComponent,
    QuestionCheckboxComponent,
    QuestionRangeComponent,
    QuestionBaseComponent]
})
export class EvaluationModule {
}
