import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ControlPanelRoutingModule } from './control-panel-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersAdminComponent } from './users-admin/users-admin.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { OrganizationsListComponent } from './users-admin/organizations-list/organizations-list.component';
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
  NzLayoutModule,
  NzMessageModule,
} from "ng-zorro-antd";

@NgModule({
  declarations: [DashboardComponent, UsersAdminComponent, OrganizationsListComponent],
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
    NzLayoutModule,
    NzMessageModule
  ],
  exports: [DashboardComponent, UsersAdminComponent]
})
export class ControlPanelModule { }
