import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EvaluationRoutingModule } from './evaluation-routing.module';
import { EvaluationComponent } from './evaluation.component';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {TranslateModule} from '@ngx-translate/core';
import { EvaluationDetailsComponent } from './evaluation-details/evaluation-details.component';
import {FormsModule} from '@angular/forms';
import {PipesModule} from '../../pipes/pipes.module';
import { EvaluateComponent } from './evaluate/evaluate.component';
import {ComponentsModule} from '../../components/components.module';

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
  declarations: [EvaluationComponent, EvaluationDetailsComponent, EvaluateComponent]
})
export class EvaluationModule { }
