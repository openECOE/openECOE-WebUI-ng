import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {EcoeComponent} from './ecoe.component';
import {InformationComponent} from './information/information.component';
import {StationsComponent} from './stations/stations.component';
import {QuestionsComponent} from './questions/questions.component';
import {ExamComponent} from './exam/exam.component';
import {PlannerComponent} from './planner/planner.component';
import {StudentsComponent} from './students/students.component';
import {AuthenticationGuard} from '../../../guards/authentication/authentication.guard';
import {ScheduleComponent} from './schedule/schedule.component';
import {Role} from '../../../models';
import {StationDetailsComponent} from './stations/station-details/station-details.component';
import {QuestionsListComponent} from '../../../components/questions-list/questions-list.component';
import {StateComponent} from './state/state.component';

const routes: Routes = [
  {
    path: '',
    component: EcoeComponent,
    canActivate: [AuthenticationGuard],
    children: [
      {
        path: '',
        children: [
          {path: 'stations', component: StationsComponent,                      data: {title: 'STATIONS',   roles: [Role.Admin]}},
          {path: 'stations/:id', component: StationDetailsComponent,            data: {title: 'STATIONS',   roles: [Role.Admin]}},
          {path: 'stations/:id/qblocks/:id', component: QuestionsListComponent, data: {title: 'QUESTIONS',  roles: [Role.Admin]}},
          {path: 'questions', component: QuestionsComponent,                    data: {title: 'QUESTIONS',  roles: [Role.Admin]}},
          {path: 'exam', component: ExamComponent,                              data: {title: 'EXAM',       roles: [Role.Admin]}},
          {path: 'planner', component: PlannerComponent,                        data: {title: 'PLANNER',    roles: [Role.Admin]}},
          {path: 'students', component: StudentsComponent,                      data: {title: 'STUDENTS',   roles: [Role.Admin]}},
          {path: 'schedule', component: ScheduleComponent,                      data: {title: 'SCHEDULE',   roles: [Role.Admin]}},
          {path: 'state', component: StateComponent,                            data: {title: 'STATE',      roles: [Role.Admin]}},
          {path: '', component: InformationComponent},
          {path: '**', redirectTo: ''}
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EcoeRoutingModule { }
