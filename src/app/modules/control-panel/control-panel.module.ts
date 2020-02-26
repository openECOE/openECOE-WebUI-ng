import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ControlPanelRoutingModule } from './control-panel-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersAdminComponent } from './users-admin/users-admin.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  declarations: [DashboardComponent, UsersAdminComponent],
  imports: [
    CommonModule,
    ControlPanelRoutingModule,
    NgZorroAntdModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  exports: [DashboardComponent, UsersAdminComponent]
})
export class ControlPanelModule { }
