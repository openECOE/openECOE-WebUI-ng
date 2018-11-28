import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-action-buttons',
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.less']
})
export class ActionButtonsComponent implements OnInit {

  @Input() isEditing: boolean;
  @Input() isNewItem: boolean;
  @Input() index: number;
  @Input() itemsLength: number;
  @Input() showOrderButtons: boolean = false;

  @Output() changeOrder: EventEmitter<string> = new EventEmitter<string>();
  @Output() startEdit: EventEmitter<void> = new EventEmitter<void>();
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();
  @Output() save: EventEmitter<void> = new EventEmitter<void>();
  @Output() cancelEdit: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

}
