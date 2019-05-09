import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CpanelComponent } from './cpanel.component';
import {CpanelRoutingModule} from './cpanel-routing.module';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {TranslateModule} from '@ngx-translate/core';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [CpanelComponent, DashboardComponent],
  imports: [
    CommonModule,
    CpanelRoutingModule,
    NgZorroAntdModule,
    TranslateModule
  ]
})
export class CpanelModule { }
