import {NgModule} from '@angular/core';
import {OutsideComponent} from './list-rounds/outside.component';
import {OutsideChronoComponent} from './outside-chrono/outside-chrono.component';
import {CommonModule} from '@angular/common';
import {OutsideRoutingModule} from './outside-routing.module';
import {TranslateModule} from '@ngx-translate/core';
import {PipesModule} from '../../pipes/pipes.module';
import {ComponentsModule} from '../../components/components.module';
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
  NzEmptyModule,
  NzListModule,
  NzMessageModule
} from "ng-zorro-antd";

@NgModule({
  imports: [
    CommonModule,
    OutsideRoutingModule,
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
    NzMessageModule
  ],
  declarations: [OutsideComponent, OutsideChronoComponent]
})

export class OutsideModule {}
