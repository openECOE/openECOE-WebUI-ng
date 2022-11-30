import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ControlPanelRoutingModule } from './control-panel-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersAdminComponent } from './users-admin/users-admin.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import {
  NzBreadCrumbModule,
  NzGridModule,
  NzInputModule,
  NzFormModule,
  NzModalModule,
  NzSelectModule,
  NzTagModule,
  NzButtonModule,
  NzIconModule,
  NzTableModule,
  NzAlertModule,
  NzDrawerModule,
  NzStatisticModule,
  NzCardModule,
  NzSkeletonModule,
  NzToolTipModule,
  NzPageHeaderModule,
  NzLayoutModule
} from "ng-zorro-antd";

@NgModule({
  declarations: [DashboardComponent, UsersAdminComponent],
  imports: [
    CommonModule,
    ControlPanelRoutingModule,
    NzBreadCrumbModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    NzGridModule,
    NzInputModule,
    NzFormModule,
    NzModalModule,
    NzSelectModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzTableModule,
    NzAlertModule,
    NzDrawerModule,
    NzStatisticModule,
    NzCardModule,
    NzSkeletonModule,
    NzToolTipModule,
    NzPageHeaderModule,
    NzLayoutModule
  ],
  exports: [DashboardComponent, UsersAdminComponent]
})
export class ControlPanelModule { }
