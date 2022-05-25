import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChronoAdminRoutingModule } from './chrono-admin-routing.module';
import { StateComponent } from './state/state.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@pipes/pipes.module';
import { ComponentsModule } from '@components/components.module';
import { NzBreadCrumbModule, NzGridModule, NzInputModule, NzFormModule, NzModalModule, NzSelectModule, NzTagModule, NzButtonModule, NzIconModule, NzTableModule, NzAlertModule, NzDrawerModule, NzStatisticModule, NzCardModule, NzSkeletonModule, NzToolTipModule, NzPageHeaderModule, NzLayoutModule, NzEmptyModule, NzListModule, NzPopconfirmModule, NzMessageModule } from 'ng-zorro-antd';

@NgModule({
  declarations: [StateComponent],
  imports: [
    CommonModule,
    ChronoAdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PipesModule,
    ComponentsModule,
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
    NzEmptyModule,
    NzListModule,
    NzPopconfirmModule,
    NzMessageModule
  ],
  exports: [StateComponent]
})
export class ChronoAdminModule { }
