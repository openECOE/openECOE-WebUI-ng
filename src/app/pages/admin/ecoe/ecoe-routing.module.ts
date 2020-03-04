import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {EcoeComponent} from './ecoe.component';
import {QuestionsComponent} from './questions/questions.component';
import {ExamComponent} from './exam/exam.component';
import {AuthenticationGuard} from '../../../guards/authentication/authentication.guard';
import {Roles} from '../../../models';
import {QuestionsListComponent} from '../../../components/questions-list/questions-list.component';

const routes: Routes = [
  {
    path: '',
    component: EcoeComponent,
    canActivate: [AuthenticationGuard],
    children: [
      {
        path: '',
        children: [
          {path: 'stations/:id/qblocks/:id', component: QuestionsListComponent, data: {title: 'QUESTIONS',  roles: [Roles.Admin]}},
          {path: 'questions', component: QuestionsComponent,                    data: {title: 'QUESTIONS',  roles: [Roles.Admin]}},
          {path: 'exam', component: ExamComponent,                              data: {title: 'EXAM',       roles: [Roles.Admin]}},
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
