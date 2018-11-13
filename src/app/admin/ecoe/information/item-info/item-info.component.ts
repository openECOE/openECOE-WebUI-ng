import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-item-info',
  templateUrl: './item-info.component.html',
  styleUrls: ['./item-info.component.less']
})
export class ItemInfoComponent {

  @Input() link: string;
  @Input() title: string;
  @Input() no_items: string;
  @Input() itemsArray: any[];
  @Input() icon: string;
}
