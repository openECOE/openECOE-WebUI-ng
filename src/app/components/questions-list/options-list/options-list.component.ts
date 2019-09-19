import {Component, Input, OnInit} from '@angular/core';
import {Question} from '../../../models';

@Component({
  selector: 'app-options-list',
  templateUrl: './options-list.component.html',
  styleUrls: ['./options-list.component.less']
})
export class OptionsListComponent implements OnInit {

  @Input() question: Question;
  @Input() preview: boolean;

  editCacheOption: Array<any> = [];
  valueopt: number;

  constructor() {
  }

  ngOnInit() {
    this.loadOptionsByQuestion();
  }

  /**
   * Adds to the resource passed its array of options as a new key object.
   * Then updates the options cache.
   */
  loadOptionsByQuestion() {
    this.question.options.forEach(option => {
      if (this.preview) {option.id = option.order; }
      this.editCacheOption[option.id] = {
        edit: this.editCacheOption[option.id] ? this.editCacheOption[option.id].edit : false,
        ...option
      };
    });
  }

}
