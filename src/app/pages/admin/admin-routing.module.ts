import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminComponent} from './admin.component';
import {AuthenticationGuard} from '../../guards/authentication/authentication.guard';
import {Role} from '../../models';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthenticationGuard],
    data: {roles: [Role.Admin]},
    children: [
      {
        path: '',
        children: [
          {path: 'ecoe/:id', loadChildren: './ecoe/ecoe.module#EcoeModule', data: {title: 'ECOE', roles: [Role.Admin]} },
          {path: 'cpanel', loadChildren: './cpanel/cpanel.module#CpanelModule', data: {title: 'cpanel', roles: [Role.Admin]} },
          {path: '**', redirectTo: 'cpanel'}
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
