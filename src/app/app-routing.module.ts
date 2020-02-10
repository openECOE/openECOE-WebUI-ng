import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {LoginComponent} from './components/login/login.component';
import {OutsideComponent} from './pages/outside/list-rounds/outside.component';
import {OutsideChronoComponent} from './pages/outside/outside-chrono/outside-chrono.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', component: HomeComponent, data: {breadcrumb: 'Inicio'} },
  { path: 'login', component: LoginComponent, data: {breadcrumb: 'Login'} },
  { path: 'outside',
    children: [
      { path: 'ecoe/:ecoeId/round/:roundId', component: OutsideChronoComponent},
      { path: '', component: OutsideComponent}
    ]
  },
  {
    path: 'admin',
    loadChildren: './pages/admin/admin.module#AdminModule',
    data: {
      breadcrumb: 'Administración'
    }
  },
  {
    path: 'eval',
    loadChildren: './pages/evaluation/evaluation.module#EvaluationModule',
    data: {
      breadcrumb: 'Evaluación'
    }
  },
  { path: '**', redirectTo: 'home'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
