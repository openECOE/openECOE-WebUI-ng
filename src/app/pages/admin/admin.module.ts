import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import { HomeAdminComponent } from './home-admin/home-admin.component';
import {PapaParseModule} from 'ngx-papaparse';
import {ComponentsModule} from '../../components/components.module';


@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    TranslateModule,
    PapaParseModule,
    ComponentsModule
  ],
  declarations: [
    AdminComponent,
    HomeAdminComponent
  ],
  exports: [
    AdminComponent
  ]
})
export class AdminModule { }
