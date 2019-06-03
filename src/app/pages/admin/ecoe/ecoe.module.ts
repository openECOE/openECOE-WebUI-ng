import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EcoeComponent} from './ecoe.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {TranslateModule} from '@ngx-translate/core';
import {EcoeRoutingModule} from './ecoe-routing.module';
import { AreasComponent } from './areas/areas.component';
import { StationsComponent } from './stations/stations.component';
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
import { QuestionsListComponent } from './questions/questions-list/questions-list.component';
import { OptionsListComponent } from './questions/questions-list/options-list/options-list.component';

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
    AreasComponent,
    StationsComponent,
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
    QuestionsListComponent,
    OptionsListComponent
  ],
  entryComponents: [AppStudentSelectorComponent]
})
export class EcoeModule { }
