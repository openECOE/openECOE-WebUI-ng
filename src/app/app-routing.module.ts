import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {LoginComponent} from './components/login/login.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', component: HomeComponent, data: {breadcrumb: 'Inicio'} },
  { path: 'login', component: LoginComponent, data: {breadcrumb: 'Login'} },
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

/*const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', component: HomeComponent, data: {breadcrumb: 'Inicio'} },
  { path: 'login', component: LoginComponent, data: {breadcrumb: 'Login'} },
  { path: 'admin', loadChildren: './pages/admin/admin.module#AdminModule' },
  { path: 'evaluation', loadChildren: './pages/evaluation/evaluation.module#EvaluationModule' },
  { path: '**', redirectTo: 'home'},
];*/

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
