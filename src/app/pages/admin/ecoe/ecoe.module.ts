import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EcoeComponent} from './ecoe.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {TranslateModule} from '@ngx-translate/core';
import {EcoeRoutingModule} from './ecoe-routing.module';
import { InformationComponent } from './information/information.component';
import { ItemInfoComponent } from './information/item-info/item-info.component';
import { QuestionsComponent } from './questions/questions.component';
import { ExamComponent } from './exam/exam.component';
import {PipesModule} from '../../../pipes/pipes.module';
import {ComponentsModule} from '../../../components/components.module';
import { StateComponent } from './state/state.component';

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
    InformationComponent,
    ItemInfoComponent,
    QuestionsComponent,
    ExamComponent,
    StateComponent
  ]
})
export class EcoeModule { }
