import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdminComponent} from './admin.component';
import {HomeAdminComponent} from './home-admin/home-admin.component';
import {AuthenticationGuard} from '../../guards/authentication/authentication.guard';
import {Role} from '../../models';
import {CpanelComponent} from './cpanel/cpanel.component';

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
          {path: 'ecoe/:id', loadChildren: './ecoe/ecoe.module#EcoeModule'},
          {path: 'cpanel', component: CpanelComponent},
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
export class AdminRoutingModule {
}
