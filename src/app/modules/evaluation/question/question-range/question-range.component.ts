import {Component, Input, OnInit} from '@angular/core';
import {QuestionRange} from '@app/models';

@Component({
  selector: 'app-question-range',
  templateUrl: './question-range.component.html',
  styleUrls: ['./question-range.component.less']
})
export class QuestionRangeComponent implements OnInit {

  @Input() schemaRange: QuestionRange;

  constructor() { }

  ngOnInit() {
  }

}
