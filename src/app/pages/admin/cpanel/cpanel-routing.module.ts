import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CpanelComponent} from './cpanel.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthenticationGuard} from '../../../guards/authentication/authentication.guard';
import {UsersAdminComponent} from './users-admin/users-admin.component';
import {Role} from '../../../models';


const routes: Routes = [
  {
    path: '',
    component: CpanelComponent,
    canActivate: [AuthenticationGuard],
    children: [
      {
        path: '',
        children: [
          {path: '', component: DashboardComponent},
          {path: 'users', component: UsersAdminComponent },
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

export class CpanelRoutingModule { }
