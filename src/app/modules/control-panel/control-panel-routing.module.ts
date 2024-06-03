import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PersonalDataComponent } from './users-admin/personal-data/personal-data.component';
import { UsersAdminComponent } from './users-admin/users-admin.component';
import { OrganizationsListComponent } from './users-admin/organizations-list/organizations-list.component';
import { HomeComponent } from '../ecoe/home/home.component';
import { AdminGuard } from '@app/guards/admin.guard';
import { SuperAdminGuard } from '@app/guards/super-admin.guard';

const routes: Routes = [
  { 
    path: '', 
    component: DashboardComponent,
    children: [
      { 
        path: '', 
        redirectTo: 'personal-data', 
        pathMatch: 'full' 
      },
      { 
        path: 'personal-data', 
        component: PersonalDataComponent 
      },
      { 
        path: 'users', 
        component: UsersAdminComponent, 
        canActivate: [AdminGuard] 
      },
      { 
        path: 'organizations', 
        component: OrganizationsListComponent, 
        canActivate: [SuperAdminGuard] 
      }
    ]
  },
  { 
    path: 'ecoe', 
    component: HomeComponent 
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControlPanelRoutingModule { }
