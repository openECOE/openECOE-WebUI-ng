import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {EcoeComponent} from './ecoe.component';
import {InformationComponent} from './information/information.component';
import {StationsComponent} from './stations/stations.component';
import {AreasComponent} from './areas/areas.component';
import {QuestionsComponent} from './questions/questions.component';
import {ExamComponent} from './exam/exam.component';
import {PlannerComponent} from './planner/planner.component';
import {StudentsComponent} from './students/students.component';
import {AuthenticationGuard} from '../../../guards/authentication/authentication.guard';
import {ScheduleComponent} from './schedule/schedule.component';

const routes: Routes = [
  {
    path: '',
    component: EcoeComponent,
    canActivate: [AuthenticationGuard],
    children: [
      {
        path: '',
        children: [
          {path: 'areas', component: AreasComponent},
          {path: 'stations', component: StationsComponent},
          {path: 'questions', component: QuestionsComponent},
          {path: 'exam', component: ExamComponent},
          {path: 'planner', component: PlannerComponent},
          {path: 'students', component: StudentsComponent},
          {path: 'schedule', component: ScheduleComponent},
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
