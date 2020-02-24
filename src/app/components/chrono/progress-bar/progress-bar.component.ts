import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.less']
})
export class ProgressBarComponent implements OnInit {

  @Input() totalPercent: number = 0;
  @Input() aborted: boolean = false;
  @Input() eventsToPlay: any[] = [];
  @Input() totalDuration: number = 0;

  constructor() { }

  ngOnInit() {
  }

}
