import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EcoeRoutingModule } from './ecoe-routing.module';
import { EcoeInfoComponent } from './ecoe-info/ecoe-info.component';
import { HomeComponent } from './home/home.component';
import { PipesModule } from '@pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { NzBreadCrumbModule, NzGridModule, NzInputModule, NzFormModule, NzModalModule, NzSelectModule, NzTagModule, NzButtonModule, NzIconModule, NzTableModule, NzAlertModule, NzDrawerModule, NzStatisticModule, NzCardModule, NzSkeletonModule, NzToolTipModule, NzPageHeaderModule, NzLayoutModule, NzEmptyModule, NzListModule, NzSpinModule, NzPopconfirmModule } from 'ng-zorro-antd';
import { EcoeResultsComponent } from './ecoe-results/ecoe-results.component';
import { GenerateReportsComponent } from './ecoe-results/generate-reports/generate-reports.component';

@NgModule({
  declarations: [
    EcoeInfoComponent,
    HomeComponent,
    EcoeResultsComponent,
    GenerateReportsComponent
  ],
  imports: [
    CommonModule,
    EcoeRoutingModule,
    PipesModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
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
    NzSpinModule,
    NzPopconfirmModule
  ],
  exports: [
    EcoeInfoComponent,
    HomeComponent
  ]
})
export class EcoeModule { }
