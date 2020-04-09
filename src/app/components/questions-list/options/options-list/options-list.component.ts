import {Component,  Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Question, Option} from '@app/models';

@Component({
  selector: 'app-options-list',
  templateUrl: './options-list.component.html',
  styleUrls: ['./options-list.component.less']
})
export class OptionsListComponent implements OnInit, OnChanges {

  @Input() question: Question;
  @Input() evaluate: boolean;
  @Input() answers: Option[] = [];

  editCacheOption: Array<any> = [];
  filteredAnswers: Option[] = [];

  constructor() {}

  ngOnInit() {
    this.initOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.answers && (changes.answers.currentValue as Option[]).length > 0) {
      if (this.question.options.length > 0) {
        this.question.options = Object.create(this.parseOptions(this.question.options));

        this.filteredAnswers = this.question.options.filter(f => (changes.answers.currentValue as Option[]).includes(f));
        this.setAnswers(this.filteredAnswers);
      }
    }
  }

  /**
   * Adds to the resource passed its array of options as a new key object.
   * Then updates the options cache.
   */
  initOptions() {
    this.question.options = this.parseOptions(this.question.options);

    this.question.options.forEach((option) => {
      // if (!option.id) {
      //   option.id = option.order;
      // }
      this.editCacheOption[option.order] = {
        option: option,
        checked: false,
        valueRS: 0
      };
    });
  }

  parseOptions(options: Option[]) {
    options.sort((a, b) => a.order - b.order);

    const options_idx_start_in = +options[0].order;
    if (options_idx_start_in > 0) {
      options.map((option, i) => {options[i].order = option.order - options_idx_start_in; });
    }

    return options;
  }

  resetOptions() {
    this.editCacheOption.forEach(cacheItem => cacheItem['checked'] = false);
  }

  onOptionChange($event: any, option: Option, questionType?: string) {
    if (questionType === 'radio') {
      this.editCacheOption.forEach((optionItem, idx) => {
        if (idx === option.order) {
          this.editCacheOption[idx]['checked'] = $event;
        } else {
          this.editCacheOption[idx]['checked'] = false;
        }
      });
    } else if (questionType === 'checkbox') {
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
