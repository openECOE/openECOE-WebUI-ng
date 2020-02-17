import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminEcoeRoutingModule } from './admin-ecoe-routing.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { PipesModule } from 'src/app/pipes/pipes.module';
import {TranslateModule} from '@ngx-translate/core';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AdminEcoeRoutingModule,
    NgZorroAntdModule,
    PipesModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule
  ]
})
export class AdminEcoeModule { }
