import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EcoeRoutingModule } from './ecoe-routing.module';
import { EcoeInfoComponent } from './ecoe-info/ecoe-info.component';
import { HomeComponent } from './home/home.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  declarations: [
    EcoeInfoComponent,
    HomeComponent
  ],
  imports: [
    CommonModule,
    EcoeRoutingModule,
    NgZorroAntdModule,
    PipesModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  exports: [ 
    EcoeInfoComponent,
    HomeComponent
  ]
})
export class EcoeModule { }
