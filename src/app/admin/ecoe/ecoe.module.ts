import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EcoeComponent} from './ecoe.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {TranslateModule} from '@ngx-translate/core';
import {EcoeRoutingModule} from './ecoe-routing.module';
import { AreasComponent } from './areas/areas.component';
import { StationsComponent } from './stations/stations.component';
import { InformationComponent } from './information/information.component';
import { ItemInfoComponent } from './information/item-info/item-info.component';

@NgModule({
  imports: [
    CommonModule,
    EcoeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    TranslateModule
  ],
  declarations: [
    EcoeComponent,
    AreasComponent,
    StationsComponent,
    InformationComponent,
    ItemInfoComponent
  ]
})
export class EcoeModule { }
