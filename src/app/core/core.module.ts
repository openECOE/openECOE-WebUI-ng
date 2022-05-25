import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { SubmenuComponent } from './submenu/submenu.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UsermenuComponent } from './usermenu/usermenu.component';
import { NzDropDownModule, NzIconModule, NzPageHeaderModule } from 'ng-zorro-antd';


@NgModule({
  declarations: [MenuComponent, SubmenuComponent, UsermenuComponent],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NzDropDownModule,
    NzPageHeaderModule,
    NzIconModule
  ],
  exports: [SubmenuComponent, UsermenuComponent, MenuComponent]
})
export class CoreModule { }
