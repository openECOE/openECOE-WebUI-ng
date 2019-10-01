import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Question, Option} from '../../../models';

@Component({
  selector: 'app-options-list',
  templateUrl: './options-list.component.html',
  styleUrls: ['./options-list.component.less']
})
export class OptionsListComponent implements OnInit, OnChanges {

  @Input() question: Question;
  @Input() preview: boolean;
  @Input() evaluate: boolean;
  @Input() answers: Option[] = [];

  @Output() optionChanged: EventEmitter<any> = new EventEmitter<any>();

  editCacheOption: Array<any> = [];
  valueopt: number[] = [];

  constructor() {
  }

  ngOnInit() {
    this.setCheckedOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.answers && changes.answers.currentValue) {
      this.optionChecked(changes.answers.currentValue);
    }
  }

  /**
   * Adds to the resource passed its array of options as a new key object.
   * Then updates the options cache.
   */
  setCheckedOptions() {
    this.question.options.forEach(option => {
      if (this.preview) {option.id = option.order; }
      this.editCacheOption[option.id] = {
        option: option,
        checked: !this.evaluate,
        valueRS: 0
      };
    });
  }

  updateAnswer(params) {
    this.optionChanged.emit(params);
  }

  onOptionChange($event: any, option: Option, questionType?: string) {
    if (questionType === 'RS') {
      console.log('valueopt', $event, option);
      this.updateAnswer({
        option: this.question.options[$event - 1],
        checked: $event
      });
      return;
    }
    this.editCacheOption[option.id]['checked'] = $event;
    this.updateAnswer({option: option, checked: $event});
  }

  optionChecked(options: Option[]) {
    if (options && options.length > 0) {
      this.setCheckedOptions();
      this.question.options.forEach(option => {
        const idx = this.answers.indexOf(option);
        if (idx >= 0) {
          this.editCacheOption[option.id]['checked'] = true;
        }
      });
    }
  }

  getIndex(): number {
    if (this.answers.length > 0 && this.question.options.length > 0) {
      const res = this.question.options.filter(f => this.answers.includes(f));
      return (res.length > 0) ? res[0].order - 1 : 0;
    } else {
      return 0;
    }
  }
}
