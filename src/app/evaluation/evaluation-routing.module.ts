import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthenticationGuard} from '../guards/authentication/authentication.guard';

const routes: Routes = [
  {
    canActivate: [AuthenticationGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EvaluationRoutingModule { }
