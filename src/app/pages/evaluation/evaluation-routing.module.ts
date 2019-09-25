import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthenticationGuard} from '../../guards/authentication/authentication.guard';
import {EvaluationComponent} from './evaluation.component';
import {Role} from '../../models';
import {EvaluationDetailsComponent} from './evaluation-details/evaluation-details.component';
import {EvaluateComponent} from './evaluate/evaluate.component';


const routes: Routes = [
  {
    path: '',
    component: EvaluationComponent,
    canActivate: [AuthenticationGuard],
    data: {roles: [Role.Admin]}
  },
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'ecoe/:ecoeId/station/:stationId/shift/:shiftId/round/:roundId', component: EvaluateComponent},
  { path: 'ecoe/:id', component: EvaluationDetailsComponent},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EvaluationRoutingModule { }
