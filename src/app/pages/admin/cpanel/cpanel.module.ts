import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CpanelComponent } from './cpanel.component';
import {CpanelRoutingModule} from './cpanel-routing.module';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [CpanelComponent],
  imports: [
    CommonModule,
    CpanelRoutingModule,
    NgZorroAntdModule,
    TranslateModule
  ]
})
export class CpanelModule { }
