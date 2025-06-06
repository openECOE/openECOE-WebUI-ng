import {NgModule} from '@angular/core';
import {OutsideComponent} from './list-rounds/outside.component';
import {OutsideChronoComponent} from './outside-chrono/outside-chrono.component';
import {CommonModule} from '@angular/common';
import {OutsideRoutingModule} from './outside-routing.module';
import {TranslateModule} from '@ngx-translate/core';
import {PipesModule} from '../../pipes/pipes.module';
import {ComponentsModule} from '../../components/components.module';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMessageModule } from 'ng-zorro-antd/message';


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
