import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersAdminComponent } from './users-admin/users-admin.component';
import { OrganizationsListComponent } from './users-admin/organizations-list/organizations-list.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'users', component: UsersAdminComponent },
  { path: 'organizations', component: OrganizationsListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControlPanelRoutingModule { }
