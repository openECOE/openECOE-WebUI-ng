import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

import {NgZorroAntdModule} from 'ng-zorro-antd';

import {CpanelComponent} from './cpanel.component';
import {CpanelRoutingModule} from './cpanel-routing.module';
import {DashboardComponent} from './dashboard/dashboard.component';
import {UsersAdminComponent} from './users-admin/users-admin.component';
import {UploadAndParseComponent} from '../../../components/upload-and-parse/upload-and-parse.component';
import {ActionButtonsComponent} from '../../../components/action-buttons/action-buttons.component';

@NgModule({
  declarations: [
    CpanelComponent,
    DashboardComponent,
    UsersAdminComponent,
    UploadAndParseComponent,
    ActionButtonsComponent
  ],
  imports: [
    CommonModule,
    CpanelRoutingModule,
    NgZorroAntdModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CpanelModule {
}
