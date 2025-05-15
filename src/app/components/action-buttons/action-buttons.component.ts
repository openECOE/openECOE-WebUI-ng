import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

/**
 * Generic component with actions (EDIT, DELETE, CANCEL...)
 */
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
  @Input() showDeleteButton: boolean = true;
  @Input() showOrderButtons: boolean = false;
  @Input() showNavigateQuestions: boolean = false;
  @Input() showEditButton: boolean = true;

  
  @Output() changeOrder: EventEmitter<string> = new EventEmitter<string>();
  @Output() startEdit: EventEmitter<void> = new EventEmitter<void>();
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();
  @Output() save: EventEmitter<void> = new EventEmitter<void>();
  @Output() cancelEdit: EventEmitter<void> = new EventEmitter<void>();
  @Output() navigateQuestions: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

}
