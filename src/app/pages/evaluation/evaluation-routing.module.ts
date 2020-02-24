import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {EvaluationDetailsComponent} from './evaluation-details/evaluation-details.component';
import {EvaluateComponent} from './evaluate/evaluate.component';


const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'ecoe/:ecoeId/station/:stationId/shift/:shiftId/round/:roundId', component: EvaluateComponent},
  { path: 'ecoe/:id', component: EvaluationDetailsComponent},
  { path: 'home', redirectTo: '/'},
  { path: '**', redirectTo: '/home'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EvaluationRoutingModule { }
