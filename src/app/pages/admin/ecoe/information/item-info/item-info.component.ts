import {Component, Input} from '@angular/core';
import {Pagination} from '@openecoe/potion-client';

@Component({
  selector: 'app-item-info',
  templateUrl: './item-info.component.html',
  styleUrls: ['./item-info.component.less']
})
export class ItemInfoComponent {

  @Input() link: string;
  @Input() title: string;
  @Input() no_items: string;
  @Input() itemsPagination: any | Pagination<any>;
  @Input() icon: string;
  @Input() theme: string = 'fill';
}
