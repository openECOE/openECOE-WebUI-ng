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
  @Input() initStage: [];

  eventsToPlay: {};
  countDownEvents: {}[] = [];
  currentCountDownEvent: {event: {}, minutes: number, seconds: number} = { event: null, minutes: 0, seconds: 0};
  totalPercent: number;
  minutes: number = 0;
  seconds: number = 0;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentSeconds && changes.currentSeconds.currentValue) {
      this.totalPercent = ( this.currentSeconds / this.totalDuration) * 100;
      this.minutes = Math.trunc((this.totalDuration - this.currentSeconds) / 60);
      this.seconds = ((this.totalDuration - this.currentSeconds) % 60 );

      this.setCurrentCountdownTimer();
    }
    if (changes.event && changes.event.currentValue) {
      this.playAudio(this.event['sound'])
        .catch(err => console.log(err));
      this.setEvents(this.event);
    }
    if (changes.initStage && changes.initStage.currentValue) {
      this.eventsToPlay = undefined;
      this.countDownEvents = [];
      this.currentCountDownEvent = {event: null, minutes: 0, seconds: 0};
    }
  }

  playAudio(src: string) {
    if (src) {
      const audio = new Audio();
      audio.src = '../../../assets/sounds/' + src;
      audio.load();
      return audio.play();
    } else {
      return new Promise(resolve => resolve('No audio'));
    }
  }

  setEvents(events: {}) {
    this.eventsToPlay = events;
    this.countDownEvents = (events['stage']['events'] as Array<Object>).filter( e => e['is_countdown']);
  }

  setCurrentCountdownTimer() {
    if (this.countDownEvents.length > 0) {
      for (const countDownEvent of this.countDownEvents) {
        if (countDownEvent['t'] >= this.currentSeconds) {
          console.log(this.currentCountDownEvent);
          this.currentCountDownEvent.event = countDownEvent;
          this.currentCountDownEvent.minutes = Math.trunc((countDownEvent['t'] - this.currentSeconds) / 60);
          this.currentCountDownEvent.seconds = (countDownEvent['t'] - this.currentSeconds) % 60;
          break;
        } else {
          this.currentCountDownEvent = {event: null, minutes: 0, seconds: 0};
        }
      }
    }
  }
}
