import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, TemplateRef} from '@angular/core';
import {ChronoService} from '../../services/chrono/chrono.service';
import {Round, Station} from '../../models';
import * as moment from 'moment';

@Component({
  selector: 'app-chrono',
  templateUrl: './chrono.component.html',
  styleUrls: ['./chrono.component.less'],
  providers: [ChronoService]
})
export class ChronoComponent implements OnChanges, OnDestroy {

  @Input() private round: Round;
  @Input() private roundId: number;
  @Input() private station: Station;
  @Input() private showDetails: boolean = true;
  @Input() private mute: boolean = false;
  @Input() private idEcoe: number;
  @Input() private withPreview: boolean = false;
  @Input() private templateBeforeStart: TemplateRef<void>;
  @Output() private started: EventEmitter<number> = new EventEmitter<number>();

  private aborted: boolean;
  private stageName: string;
  private currentSeconds: number;
  private totalDuration: number;
  private event: {};
  private initStage: any[];

  private eventsToPlay: any[];
  private countDownEvents: {}[] = [];
  private currentCountDownEvent: {event: {}, minutes: number, seconds: number} = { event: null, minutes: 0, seconds: 0};
  private totalPercent: number;
  private minutes: number = 0;
  private seconds: number = 0;
  private rerunsDescription: string;
  private roundDurationSeconds: number;
  private remainingTime: number;

  connectedFlag: boolean;
  tictacFlag: boolean;


  momentRef = moment;
  private configurationECOE: Object;

  constructor(private chronoService: ChronoService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.round && changes.round.currentValue) ||
        (changes.roundId && changes.roundId.currentValue)) {
      const roundId = changes.round ? changes.round.currentValue : changes.roundId.currentValue;
      this.getChronoData(roundId, this.idEcoe);
    }
  }

  getChronoData(round: Round, idEcoe: number) {
    this.chronoService.onConnected(round.id || this.roundId).subscribe( () => {
      this.connectedFlag = true;
      this.getConfigurationECOE(idEcoe);

      this.chronoService.onReceive('init_stage').subscribe((data: any[]) => {
        this.initStage = data;
        this.getRerunDescription(data[1]);
        this.resetEventsValues();
      });
      this.chronoService.onReceive('end_round').subscribe((data: any[]) => {
        this.stageName = (data[1]['data'] as string).toUpperCase();
      });
      this.chronoService.onReceive('evento').subscribe(data => {
        this.event = data[1];
        this.onGetEvent(this.event);
      });
      this.chronoService.onReceive('aborted').subscribe(data => {
        this.aborted = true;
        this.stageName = (data[0] as string).toUpperCase();
      });
      this.chronoService.onReceive('tic_tac').subscribe((data: any[]) => {
        this.tictacFlag = true;
        this.started.next(this.idEcoe);
        this.onTicTac(data);
      });
    });
  }

  resetEventsValues() {
    // init stage changed
    this.eventsToPlay = undefined;
    this.countDownEvents = [];
    this.currentCountDownEvent = {event: null, minutes: 0, seconds: 0};
  }

  onGetEvent(event: {}) {
    // changed event
    if (!this.mute) {
      this.playAudio(this.event['sound'])
        .catch(err => console.log(err));
    }
    this.setEvents(event['stage']['events']);
  }

  onTicTac(data: any[]) {
    this.aborted        = false;
    this.stageName      = data[1]['stage']['name'];
    this.currentSeconds = parseInt(data[1]['t'], 10);
    this.totalDuration  = parseInt(data[1]['stage']['duration'], 10);
    this.remainingTime  = this.calcRemainingTime(data[1]['num_rerun'], data[1]['total_reruns'], data[1]['t']);
    this.totalPercent   = (this.currentSeconds / this.totalDuration) * 100;
    this.minutes        = Math.trunc((this.totalDuration - this.currentSeconds) / 60);
    this.seconds        = ((this.totalDuration - this.currentSeconds) % 60 );

    // Sets events only firt time (ex: when page is reloaded)
    if (!this.eventsToPlay || this.eventsToPlay.length < 0) {
      this.setEvents(data[1]['stage']['events']);
    }
    if (!this.rerunsDescription) { this.getRerunDescription(data[1]); }

    this.setCurrentCountdownTimer();
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

  setEvents(events: any[]) {
    const stationId = this.station ? this.station.id : 0;
    this.eventsToPlay = events
      .filter(event => (event['stations'] as any[])
        .includes(stationId))
      .sort((a, b) => a['t'] - b['t']);
    this.countDownEvents = this.eventsToPlay.filter( e => e['is_countdown']);
  }

  setCurrentCountdownTimer() {
    if (this.countDownEvents.length > 0) {
      for (const countDownEvent of this.countDownEvents) {
        if (countDownEvent['t'] >= this.currentSeconds) {
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

  calcRemainingTime(num_rerun: number, total_reruns: number, t: number) {
   return (((total_reruns - num_rerun + 1) * this.roundDurationSeconds) - t);
  }

  calcRoundDuration(configuration: Object) {
    this.roundDurationSeconds = 0;
    for (const schedule of configuration['schedules'])  {
      this.roundDurationSeconds += schedule['duration'];
    }
  }

  getConfigurationECOE(ecoeId: number) {
    this.chronoService.getChronoConfiguration(ecoeId).subscribe(next => {
      if (next && next[0]) {
        this.configurationECOE = next[0];
        this.calcRoundDuration(next[0]);
      }
    });
  }

  private getRerunDescription(data: Object) {
    this.rerunsDescription = data['num_rerun'] + '/' + data['total_reruns'];
  }

  ngOnDestroy() {
    if (this.chronoService) {
      this.chronoService.disconnect();
    }
  }
}
