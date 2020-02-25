import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AreasComponent } from './areas/areas.component';
import { StationsComponent } from './stations/stations.component';
import {EcoeInfoComponent} from '../ecoe/ecoe-info/ecoe-info.component';
import { StationDetailsComponent } from './station-details/station-details.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { StudentsComponent } from './students/students.component';
import { PlannerComponent } from './planner/planner.component';

const routes: Routes = [
  { 
    path: '',
    children: [
      { path: '', component: EcoeInfoComponent },
      { path: 'areas', component: AreasComponent },
      { path: 'stations', component: StationsComponent },
      { path: 'stations/:stationId', component: StationDetailsComponent },
      { path: 'schedule', component: ScheduleComponent },
      { path: 'students', component: StudentsComponent },
      { path: 'planner', component: PlannerComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EcoeAdminRoutingModule { }
