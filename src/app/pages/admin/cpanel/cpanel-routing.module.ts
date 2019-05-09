import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CpanelComponent} from './cpanel.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthenticationGuard} from '../../../guards/authentication/authentication.guard';


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
