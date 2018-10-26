import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import { CreateEcoeComponent } from './components/create-ecoe/create-ecoe.component';
import { HomeAdminComponent } from './components/home-admin/home-admin.component';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    TranslateModule
  ],
  declarations: [
    AdminComponent,
    CreateEcoeComponent,
    HomeAdminComponent
  ]
})
export class AdminModule { }
