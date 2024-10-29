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
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzMessageModule } from 'ng-zorro-antd/message';


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
