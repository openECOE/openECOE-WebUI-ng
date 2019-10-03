import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-chrono',
  templateUrl: './chrono.component.html',
  styleUrls: ['./chrono.component.less']
})
export class ChronoComponent implements OnChanges {

  @Input() aborted: boolean;
  @Input() stageName: string;
  @Input() currentSeconds: number;
  @Input() totalDuration: number;
  @Input() event: {};

  totalPercent: number;
  minutes: number = 0;
  seconds: number = 0;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentSeconds && changes.currentSeconds.currentValue) {
      this.totalPercent = ( this.currentSeconds / this.totalDuration) * 100;
      this.minutes = Math.trunc((this.totalDuration - this.currentSeconds) / 60);
      this.seconds = ((this.totalDuration - this.currentSeconds) % 60 );
    }
    if (changes.event && changes.event.currentValue) {
      console.log('received event', changes.event.currentValue);
      if (this.event['sound']) {
        console.log('there is song!!');
        this.playAudio(this.event['sound'])
          .then(result => console.log(result))
          .catch(err => console.log(err));
      } else {
        console.log('Not song!!');
      }

    }
  }

  playAudio(src: string) {
    const audio = new Audio();
    audio.src = '../../../assets/sounds/' + src;
    audio.load();
    return audio.play();
  }


}
