import {NgModule} from '@angular/core';
import {OutsideComponent} from './list-rounds/outside.component';
import {OutsideChronoComponent} from './outside-chrono/outside-chrono.component';
import {CommonModule} from '@angular/common';
import {OutsideRoutingModule} from './outside-routing.module';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {TranslateModule} from '@ngx-translate/core';
import {PipesModule} from '../../pipes/pipes.module';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    OutsideRoutingModule,
    NgZorroAntdModule,
    TranslateModule,
    PipesModule,
    ComponentsModule
  ],
  declarations: [OutsideComponent, OutsideChronoComponent]
})

export class OutsideModule {}
