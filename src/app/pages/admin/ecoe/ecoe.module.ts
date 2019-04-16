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
import { ActionButtonsComponent } from './action-buttons/action-buttons.component';
import { ExamComponent } from './exam/exam.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { StudentsComponent } from './students/students.component';
import { PlannerComponent } from './planner/planner.component';
import { UploadAndParseComponent } from './upload-and-parse/upload-and-parse.component';
import { EventsComponent } from './schedule/events/events.component';
import {PipesModule} from '../../../pipes/pipes.module';
import { PlannerSelectorComponent, AppStudentSelectorComponent } from './planner/planner-selector/planner-selector.component';

@NgModule({
  imports: [
    CommonModule,
    EcoeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    TranslateModule,
    PipesModule
  ],
  declarations: [
    EcoeComponent,
    AreasComponent,
    StationsComponent,
    InformationComponent,
    ItemInfoComponent,
    QuestionsComponent,
    ActionButtonsComponent,
    ExamComponent,
    ScheduleComponent,
    StudentsComponent,
    PlannerComponent,
    UploadAndParseComponent,
    EventsComponent,
    PlannerSelectorComponent,
    AppStudentSelectorComponent
  ],
  entryComponents: [AppStudentSelectorComponent]
})
export class EcoeModule { }
