import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AdminComponent} from './admin.component';
import {CreateEcoeComponent} from './components/create-ecoe/create-ecoe.component';
import {HomeAdminComponent} from './components/home-admin/home-admin.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        // canActivateChild: [AuthGuard],
        children: [
          {path: 'create-ecoe', component: CreateEcoeComponent},
          {path: 'ecoe/:id', loadChildren: './ecoe/ecoe.module#EcoeModule'},
          {path: '', component: HomeAdminComponent},
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
export class AdminRoutingModule { }
