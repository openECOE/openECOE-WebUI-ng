import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EcoeComponent} from './ecoe.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {TranslateModule} from '@ngx-translate/core';
import {EcoeRoutingModule} from './ecoe-routing.module';
import { QuestionsComponent } from './questions/questions.component';
import { ExamComponent } from './exam/exam.component';
import {PipesModule} from '../../../pipes/pipes.module';
import {ComponentsModule} from '../../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    EcoeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    TranslateModule,
    PipesModule,
    ComponentsModule
  ],
  declarations: [
    EcoeComponent,
    QuestionsComponent,
    ExamComponent
  ]
})
export class EcoeModule { }
