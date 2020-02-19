import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EcoeAdminRoutingModule } from './ecoe-admin-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { AreasComponent } from '../admin-ecoe/areas/areas.component';

@NgModule({
  declarations: [
    AreasComponent
  ],
  imports: [
    CommonModule,
    EcoeAdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    TranslateModule,
    PipesModule,
    ComponentsModule
  ]
})
export class EcoeAdminModule { }
