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

const routes: Routes = [
  {
    path: '',
    component: EcoeComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        // canActivateChild: [AuthGuard],
        children: [
          {path: 'areas', component: AreasComponent},
          {path: 'stations', component: StationsComponent},
          {path: 'questions', component: QuestionsComponent},
          {path: 'exam', component: ExamComponent},
          {path: 'planner', component: PlannerComponent},
          {path: 'students', component: StudentsComponent},
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
