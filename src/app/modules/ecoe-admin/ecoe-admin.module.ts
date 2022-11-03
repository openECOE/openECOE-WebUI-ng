import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EcoeAdminRoutingModule } from './ecoe-admin-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {PipesModule} from '@pipes/pipes.module';
import { ComponentsModule } from '@components/components.module';
import { AreasComponent } from './areas/areas.component';
import { StationsComponent } from './stations/stations.component';
import { StationDetailsComponent } from './station-details/station-details.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { EventsComponent } from './events-schedule/events.component';
import { StudentsComponent } from './students/students.component';
import { PlannerComponent } from './planner/planner.component';
import { PlannerSelectorComponent, AppStudentSelectorComponent } from './planner-selector/planner-selector.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { EcoeModule } from '../ecoe/ecoe.module';
import { NzBreadCrumbModule, NzGridModule, NzInputModule, NzFormModule, NzModalModule, NzSelectModule, NzTagModule, NzButtonModule, NzIconModule, NzTableModule, NzAlertModule, NzDrawerModule, NzStatisticModule, NzCardModule, NzSkeletonModule, NzToolTipModule, NzPageHeaderModule, NzLayoutModule, NzEmptyModule, NzListModule, NzPopconfirmModule, NzInputNumberModule, NzProgressModule, NzDatePickerModule, NzTimePickerModule, NzTabsModule, NzMessageModule, NzSwitchModule } from 'ng-zorro-antd';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ItemScoreComponent } from './item-score/item-score.component';


@NgModule({
  declarations: [
    AreasComponent,
    StationsComponent,
    StationDetailsComponent,
    ScheduleComponent,
    EventsComponent,
    StudentsComponent,
    PlannerComponent,
    PlannerSelectorComponent,
    StatisticsComponent,
    AppStudentSelectorComponent,
    ItemScoreComponent
  ],
  imports: [
    CommonModule,
    EcoeAdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PipesModule,
    ComponentsModule,
    EcoeModule,
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
    NzPopconfirmModule,
    NzInputNumberModule,
    NzProgressModule,
    NzTimePickerModule,
    NzDatePickerModule,
    NzTableModule,
    NzTabsModule,
    NzMessageModule,
    NzSwitchModule,
    DragDropModule
  ],
  exports: [
    AreasComponent,
    StationsComponent,
    StationDetailsComponent,
    ScheduleComponent,
    EventsComponent,
    StudentsComponent,
    PlannerComponent,
    PlannerSelectorComponent,
    AppStudentSelectorComponent
  ],
  entryComponents: [AppStudentSelectorComponent]
})
export class EcoeAdminModule { }
