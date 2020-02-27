import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChronoAdminRoutingModule } from './chrono-admin-routing.module';
import { StateComponent } from './state/state.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@pipes/pipes.module';
import { ComponentsModule } from '@components/components.module';

@NgModule({
  declarations: [StateComponent],
  imports: [
    CommonModule,
    ChronoAdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    TranslateModule,
    PipesModule,
    ComponentsModule
  ],
  exports: [StateComponent]
})
export class ChronoAdminModule { }
