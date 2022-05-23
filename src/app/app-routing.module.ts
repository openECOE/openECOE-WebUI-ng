import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './modules/ecoe/home/home.component';
import {LoginComponent} from '@components/login/login.component';

const routes: Routes = [
  { path: '', redirectTo: 'ecoe', pathMatch: 'full'},
  { path: 'login', component: LoginComponent, data: {breadcrumb: 'Login'} },
  { path: 'ecoe', component: HomeComponent },
  { path: 'ecoe/:ecoeId/admin', loadChildren: () => import('./modules/ecoe-admin/ecoe-admin.module').then(m => m.EcoeAdminModule) },
  { path: 'ecoe/:ecoeId/eval', loadChildren: () => import('./modules/evaluation/evaluation.module').then(m => m.EvaluationModule) },
  { path: 'ecoe/:ecoeId/chrono', loadChildren: () => import('./modules/chrono-admin/chrono-admin.module').then(m => m.ChronoAdminModule) },
  { path: 'outside', loadChildren: () => import('./modules/outside/outside.module').then(m => m.OutsideModule)},
  { path: 'control-panel', loadChildren: () => import('./modules/control-panel/control-panel.module').then(m => m.ControlPanelModule)},
  { path: '**', redirectTo: 'ecoe'}
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
