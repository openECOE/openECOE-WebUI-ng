import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './modules/ecoe/home/home.component';
import {LoginComponent} from './components/login/login.component';
import { EcoeInfoComponent } from './modules/ecoe/ecoe-info/ecoe-info.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'login', component: LoginComponent, data: {breadcrumb: 'Login'} },
  { path: 'home', component: HomeComponent },
  { path: 'ecoe/info/:ecoeId', component: EcoeInfoComponent },
  { path: '**', redirectTo: 'home'}
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
