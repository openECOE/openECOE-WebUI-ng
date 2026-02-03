import {Component, Input, OnInit, ChangeDetectorRef} from '@angular/core';
import {Answer, AnswerCheckBox, AnswerRadio, QuestionCheckBox, QuestionOption, QuestionRadio, Option} from '@app/models';
import {QuestionBaseComponent} from '@app/modules/evaluation/question/question-base/question-base.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import {TranslateService} from '@ngx-translate/core';

class RadioOption {
  constructor(option: QuestionOption, checked: boolean) {
    this.option = option;
    this.checked = checked;

    this.option.points = Number(this.option.points)
  }

  option: QuestionOption;
  checked: boolean;
  get class(): string {
    return this.option.points >= 0?'positive-points':'negative-points'
  }
}

@Component({
  selector: 'app-question-radio',
  templateUrl: './question-radio.component.html',
  styleUrls: ['./question-radio.component.less']
})
export class QuestionRadioComponent extends QuestionBaseComponent implements OnInit {

  @Input() question: QuestionRadio;

  RadioOptions: Array<RadioOption> = [];

  singleChecked: boolean = false;
  singleLabel: string;
  
  // Explicit property for the selected radio value
  // null = "No option" selected (default), number = specific option id selected
  selectedOptionId: number | null = null;
  
  private initialized: boolean = false;

  constructor(protected message: NzMessageService,
              protected translate: TranslateService,
              private cdr: ChangeDetectorRef) {
    super(message, translate);
  }

  ngOnInit() {
    this.RadioOptions = this.loadQuestion(this.question);
    this.initialized = true;
    // If answer was set before ngOnInit, apply it now
    if (this._answer) {
      this.loadSelected(this._answer);
    }
  }

  loadQuestion(question: QuestionRadio): Array<RadioOption> {
    const _cbList: Array<RadioOption> = [];
    if (question?.options) {
      for (const opt of question.options) {
        _cbList.push(new RadioOption(opt, false));
      }
    }
    return _cbList;
  }

  loadSelected(answer: Answer) {
    // Ensure RadioOptions is initialized before proceeding
    if (!this.initialized || this.RadioOptions.length === 0) {
      return; // Will be called again after ngOnInit
    }
    
    if (answer) {
      this.singleChecked = false;
      const _schema = (answer.schema as AnswerRadio);

      // Convert legacy empty string to null
      if (typeof (_schema.selected) === 'string' && _schema.selected === '') {
        _schema.selected = null;
      }

      const _selected = _schema.selected;
      
      // Set selectedOptionId based on what's in the answer
      // If there's a selected option, use its id_option; otherwise null (No option)
      if (_selected && _selected.id_option !== undefined && _selected.id_option !== null) {
        this.selectedOptionId = _selected.id_option;
      } else {
        // No selection = "No option"
        this.selectedOptionId = null;
      }
      
      if (this.RadioOptions.length === 1) {
        this.singleChecked = _selected ? _selected.id_option === this.RadioOptions[0].option.id_option : false;
      }
      
      // Force change detection
      this.cdr.detectChanges();
    } else {
      // No answer yet - default to "No option"
      this.singleChecked = false;
      this.selectedOptionId = null;
      this.cdr.detectChanges();
    }
  }

  changeRadioAnswer(answer: Answer, optionValue: number | null, checked: boolean) {
    if (answer) {
      if (optionValue === null) {
        // User selected "No option"
        (answer.schema as AnswerRadio).selected = null;
        answer.points = 0;
        this.selectedOptionId = null;
      } else {
        // User selected a specific option (Yes, No, etc.)
        const _radioOption = this.RadioOptions.find(_radio => _radio.option.id_option === optionValue);
        if (_radioOption) {
          (answer.schema as AnswerRadio).selected = _radioOption.option;
          answer.points = _radioOption.option.points;
          this.selectedOptionId = optionValue;
        }
      }
      
      this.saveAnswer(answer)
        .then(newAnswer => {
          this._answer = newAnswer;
        })
        .catch(reason => console.error(reason));
    }
  }

}
