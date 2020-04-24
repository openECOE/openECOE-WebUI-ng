import {Component, Input, OnInit} from '@angular/core';
import {QuestionRadio} from '@app/models';

@Component({
  selector: 'app-question-radio',
  templateUrl: './question-radio.component.html',
  styleUrls: ['./question-radio.component.less']
})
export class QuestionRadioComponent implements OnInit {

  @Input() schemaRadio: QuestionRadio;

  constructor() { }

  ngOnInit() {
  }

}
