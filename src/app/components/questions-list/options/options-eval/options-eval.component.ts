import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Option, QuestionOld} from '../../../../models';

@Component({
  selector: 'app-options-eval',
  templateUrl: './options-eval.component.html',
  styleUrls: ['./options-eval.component.less']
})
export class OptionsEvalComponent implements OnInit, OnChanges {

  @Input() question: QuestionOld;
  @Input() preview: boolean;
  @Input() answers: Option[] = [];
  @Output() optionChanged: EventEmitter<any> = new EventEmitter<any>();

  filtredAnswers: Option[] = [];
  options: OptionData[];


  constructor() {}

  ngOnInit() {
    this.options = this.initOptions(this.question.options);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.answers && (changes.answers.currentValue as Option[]).length > 0) {
      if (this.question.options.length > 0) {
        this.filtredAnswers = this.question.options.filter(f => (changes.answers.currentValue as Option[]).includes(f));
        this.setAnswers(this.filtredAnswers);
      }
    } else {
      this.filtredAnswers = [];
      this.resetOptions();
    }
  }

  /**
   * Adds to the resource passed its array of options as a new key object.
   * Then updates the options cache.
   */
  initOptions(options: Option[]) {
    const optionsData: OptionData[] = [];

    if (!options || options.length < 1) { return optionsData; }

    options = this.parseOptions(options);

    options.forEach((option, idx) => {
      if (this.preview) {option.id = option.order; }
      optionsData[idx] = {
        option: option,
        checked: false
      };
    });
    return optionsData;
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
    if (this.options) {
      this.options.forEach(item => item.checked = false);
    }
  }

  updateAnswer(params) {
    this.optionChanged.emit(params);
  }

  onOptionChange($event: any, option: Option, questionType?: string) {
    if (questionType === 'range') {
      this.updateAnswer({
        option: this.question.options[$event - 1],
        checked: !!(option)
      });
    } else {
      if (questionType === 'radio') {
        this.updateAnswer({option: option, checked: $event});
        this.options.forEach((optionItem, idx) => {
          if (idx === option.order) {
            this.options[idx]['checked'] = $event;
          } else {
            this.options[idx]['checked'] = false;
          }
        });
      } else if (questionType === 'checkbox') {
        this.updateAnswer({option: option, checked: $event});
        this.options[this.question.options.indexOf(option)]['checked'] = $event;
      }
    }
  }

  setAnswers(answers: Option[]) {
    this.resetOptions();
    if (answers && answers.length > 0) {
      answers.forEach((answer) => {
        const idx = this.question.options.indexOf(answer);
        this.options[idx].checked = true;
      });
    }
  }

  getIndex(): number {
    if (this.answers.length > 0 && this.question.options.length > 0) {
      if (this.question.options[0].order > 0) {
        this.question.options = this.parseOptions(this.question.options);
      }
      const res = this.question.options.filter(f => this.answers.includes(f));

      return (res.length > 0) ? (this.question.options.indexOf(res[0])) : 0;
    } else {
      return 0;
    }
  }

}

interface OptionData {
  option: Option;
  checked?: boolean;
}
