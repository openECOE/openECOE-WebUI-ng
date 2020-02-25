import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {EvaluationDetailsComponent} from './evaluation-details/evaluation-details.component';
import {EvaluateComponent} from './evaluate/evaluate.component';


const routes: Routes = [
  { path: '', component: EvaluationDetailsComponent, pathMatch: 'full'},
  { path: 'date/:date/round/:roundId/station/:stationId', component: EvaluationDetailsComponent},
  { path: 'station/:stationId/shift/:shiftId/round/:roundId/date/:date', component: EvaluateComponent},
  { path: 'station/:stationId/shift/:shiftId/round/:roundId', component: EvaluateComponent},
  { path: '**', redirectTo: '/'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EvaluationRoutingModule { }
