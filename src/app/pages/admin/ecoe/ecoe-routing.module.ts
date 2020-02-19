import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {EcoeComponent} from './ecoe.component';
import {QuestionsComponent} from './questions/questions.component';
import {ExamComponent} from './exam/exam.component';
import {AuthenticationGuard} from '../../../guards/authentication/authentication.guard';
import {Role} from '../../../models';
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
          {path: 'stations/:id/qblocks/:id', component: QuestionsListComponent, data: {title: 'QUESTIONS',  roles: [Role.Admin]}},
          {path: 'questions', component: QuestionsComponent,                    data: {title: 'QUESTIONS',  roles: [Role.Admin]}},
          {path: 'exam', component: ExamComponent,                              data: {title: 'EXAM',       roles: [Role.Admin]}},
          {path: 'state', component: StateComponent,                            data: {title: 'STATE',      roles: [Role.Admin]}},
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
