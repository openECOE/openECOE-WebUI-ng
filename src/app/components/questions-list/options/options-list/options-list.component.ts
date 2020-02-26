import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Question, Option} from '../../../../models';

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
  filtredAnswers: Option[] = [];


  constructor() {}

  ngOnInit() {
    this.initOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.answers && (changes.answers.currentValue as Option[]).length > 0) {
      if (this.question.options.length > 0) {
        this.question.options = Object.create(this.parseOptions(this.question.options));

        console.log('onChanges', this.question.options);
        this.filtredAnswers = this.question.options.filter(f => (changes.answers.currentValue as Option[]).includes(f));
        this.setAnswers(this.filtredAnswers);
      }
    }
  }

  /**
   * Adds to the resource passed its array of options as a new key object.
   * Then updates the options cache.
   */
  initOptions() {
    this.question.options = this.parseOptions(this.question.options);

    console.log('onInit', this.question.options);
    this.question.options.forEach((option) => {
      if (this.preview && !option.id) {
        option.id = option.order;
      }
      this.editCacheOption[option.order] = {
        option: option,
        checked: !this.evaluate,
        valueRS: 0
      };
    });
  }

  parseOptions(options: Option[]) {
    options.sort((a, b) => a.order - b.order);

    const options_idx_start_in = +options[0].order;
    // console.log('parseOptions()::options_idx_start_in', options_idx_start_in );
    if (options_idx_start_in > 0) {
      options.map((option, i) => {options[i].order = option.order - options_idx_start_in; });
    }

    return options;
  }

  resetOptions() {
    this.editCacheOption.forEach(cacheItem => cacheItem['checked'] = false);
  }

  updateAnswer(params) {
    this.optionChanged.emit(params);
  }

  onOptionChange($event: any, option: Option, questionType?: string) {
    if (questionType === 'RS') {
      this.updateAnswer({
        option: this.question.options[$event - 1],
        checked: !!(option)
      });
    } else {
      this.updateAnswer({option: option, checked: $event});
      this.editCacheOption[option.order]['checked'] = $event;
    }
  }

  setAnswers(answers: Option[]) {
    this.resetOptions();
    if (answers && answers.length > 0) {
      answers.forEach((answer) => {
        const idx = this.question.options.indexOf(answer);
        this.editCacheOption[idx]['checked'] = true;
      });
    }
  }

  getIndex(): number {
    if (this.answers.length > 0 && this.question.options.length > 0) {
      if (this.question.options[0].order > 0) {
        this.question.options = this.parseOptions(this.question.options);
      }
      const res = this.question.options.filter(f => this.answers.includes(f));

      return (res.length > 0) ? (this.question.options.indexOf(res[0]) ) : 0;
    } else {
      return 0;
    }
  }
}
