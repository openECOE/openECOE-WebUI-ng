import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OutsideChronoComponent} from './outside-chrono/outside-chrono.component';
import {OutsideComponent} from './list-rounds/outside.component';

const routes: Routes = [
  { path: 'ecoe/:ecoeId/round/:roundId', component: OutsideChronoComponent},
  { path: '', component: OutsideComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class OutsideRoutingModule { }
