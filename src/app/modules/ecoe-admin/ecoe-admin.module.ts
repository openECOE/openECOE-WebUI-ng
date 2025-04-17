import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { EcoeAdminRoutingModule } from "./ecoe-admin-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { PipesModule } from "@pipes/pipes.module";
import { ComponentsModule } from "@components/components.module";
import { AreasComponent } from "./areas/areas.component";
import { StationsComponent } from "./stations/stations.component";
import { StationDetailsComponent } from "./stations/station-details/station-details.component";
import { ScheduleComponent } from "./schedule/schedule.component";
import { EventsComponent } from "./events-schedule/events.component";
import { StudentsComponent } from "./students/students.component";
import { PlannerComponent } from "./planner/planner.component";
import {
  PlannerSelectorComponent,
  AppStudentSelectorComponent,
} from "./planner-selector/planner-selector.component";
import { EcoeModule } from "../ecoe/ecoe.module";
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
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

import { DragDropModule } from "@angular/cdk/drag-drop";
import { EvaluatorsComponent } from './evaluators/evaluators.component';

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
    AppStudentSelectorComponent,
    EvaluatorsComponent,
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
    DragDropModule,
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
    AppStudentSelectorComponent,
  ],
  entryComponents: [AppStudentSelectorComponent],
})
export class EcoeAdminModule {}
