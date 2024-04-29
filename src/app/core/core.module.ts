import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { SubmenuComponent } from './submenu/submenu.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UsermenuComponent } from './usermenu/usermenu.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';


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
