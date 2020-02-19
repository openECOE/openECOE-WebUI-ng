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
import { ScheduleComponent } from './schedule/schedule.component';
import { StudentsComponent } from './students/students.component';
import { PlannerComponent } from './planner/planner.component';
import { EventsComponent } from './schedule/events/events.component';
import {PipesModule} from '../../../pipes/pipes.module';
import { PlannerSelectorComponent, AppStudentSelectorComponent } from './planner/planner-selector/planner-selector.component';
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
    ScheduleComponent,
    StudentsComponent,
    PlannerComponent,
    EventsComponent,
    PlannerSelectorComponent,
    AppStudentSelectorComponent,
    StateComponent
  ],
  entryComponents: [AppStudentSelectorComponent]
})
export class EcoeModule { }
