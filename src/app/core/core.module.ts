import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { SubmenuComponent } from './submenu/submenu.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UsermenuComponent } from './usermenu/usermenu.component';

@NgModule({
  declarations: [MenuComponent, SubmenuComponent, UsermenuComponent],
  imports: [
    CommonModule,
    NgZorroAntdModule,
    TranslateModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [SubmenuComponent, UsermenuComponent, MenuComponent]
})
export class CoreModule { }
