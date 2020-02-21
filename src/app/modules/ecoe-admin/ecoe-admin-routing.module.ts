import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AreasComponent } from './areas/areas.component';
import { StationsComponent } from './stations/stations.component';

const routes: Routes = [
  { path: 'areas', component: AreasComponent },
  { path: 'stations', component: StationsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EcoeAdminRoutingModule { }
