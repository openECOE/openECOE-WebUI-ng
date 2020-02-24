import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './modules/ecoe/home/home.component';
import {LoginComponent} from './components/login/login.component';

const routes: Routes = [
  { path: '', redirectTo: 'ecoe', pathMatch: 'full'},
  { path: 'login', component: LoginComponent, data: {breadcrumb: 'Login'} },
  { path: 'ecoe', component: HomeComponent },
  { path: 'ecoe/:ecoeId/admin', loadChildren: './modules/ecoe-admin/ecoe-admin.module#EcoeAdminModule' },
  { path: 'ecoe/:ecoeId/eval', loadChildren: './modules/evaluation/evaluation.module#EvaluationModule' },
  { path: 'ecoe/:ecoeId/chrono', loadChildren: './modules/chrono-admin/chrono-admin.module#ChronoAdminModule' },
  { path: 'outside', loadChildren: './modules/outside/outside.module#OutsideModule'},
  { path: '**', redirectTo: 'ecoe'}
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
