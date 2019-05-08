import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CpanelComponent } from './cpanel.component';
import {CpanelRoutingModule} from './cpanel-routing.module';

@NgModule({
  declarations: [CpanelComponent],
  imports: [
    CommonModule,
    CpanelRoutingModule
  ]
})
export class CpanelModule { }
