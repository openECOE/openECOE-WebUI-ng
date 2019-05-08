import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CpanelComponent} from './cpanel.component';
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
          {path: '', component: CpanelComponent},
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
