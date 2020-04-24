import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Option, Question, QuestionCheckBox, QuestionOld, QuestionRadio, QuestionRange, QuestionSchema} from '../../../../models';

@Component({
  selector: 'app-options-eval',
  templateUrl: './options-eval.component.html',
  styleUrls: ['./options-eval.component.less']
})
export class OptionsEvalComponent implements OnInit, OnChanges {

  @Input() question: Question;
  @Input() preview: boolean;
  @Input() answers: Option[] = [];
  @Output() optionChanged: EventEmitter<any> = new EventEmitter<any>();

  filteredAnswers: Option[] = [];
  options: OptionData[];


  constructor() {}

  ngOnInit() {
    this.options = this.initOptions(this.question.schema);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.answers && (changes.answers.currentValue as Option[]).length > 0) {
      if (this.question.schema instanceof QuestionRadio || this.question.schema instanceof QuestionCheckBox) {
        if (this.question.schema.options.length > 0) {
          this.filteredAnswers = this.question.options.filter(f => (changes.answers.currentValue as Option[]).includes(f));
          this.setAnswers(this.filteredAnswers);
        }
      }
    } else {
      this.filteredAnswers = [];
      this.resetOptions();
    }
  }

  /**
   * Adds to the resource passed its array of options as a new key object.
   * Then updates the options cache.
   */
  initOptions(schema: QuestionSchema) {
    const optionsData: OptionData[] = [];
    let _options = null;

    if (schema instanceof QuestionRadio || schema instanceof QuestionCheckBox) {
      _options = schema.options;
    } else if (this.question.schema instanceof QuestionRange) {
      _options = [this.question.schema];
    }

    if (!_options || _options.length < 1) { return optionsData; }

    _options = this.parseOptions(_options);

    _options.forEach((option, idx) => {
      // if (this.preview) {option.id = option.order; }
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
