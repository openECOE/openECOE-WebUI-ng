import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild} from '@angular/core';
import {ChronoService} from '../../services/chrono/chrono.service';
import {Round, Station} from '../../models';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationDataOptions, NzNotificationService } from 'ng-zorro-antd/notification';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-chrono',
  templateUrl: './chrono.component.html',
  styleUrls: ['./chrono.component.less'],
  providers: [ChronoService]
})
export class ChronoComponent implements OnChanges, OnDestroy, OnInit {

  @Input() round: Round;
  @Input() roundId: number;
  @Input() station: Station;
  @Input() showDetails: boolean = true;
  @Input() mute: boolean = false;
  @Input() idEcoe: number;
  @Input() withPreview: boolean = false;
  @Input() templateBeforeStart: TemplateRef<void>;
  @Output() started: EventEmitter<number> = new EventEmitter<number>();

  aborted: boolean;
  stageName: string;
  currentSeconds: number;
  totalDuration: number;
  event: {};
  initStage: any[];

  eventsToPlay: any[];
  countDownEvents: {}[] = [];
  currentCountDownEvent: {event: {}, minutes: number, seconds: number} = { event: null, minutes: 0, seconds: 0};
  totalPercent: number;
  minutes: number = 0;
  seconds: number = 0;
  rerunsDescription: string;
  roundDurationSeconds: number;
  remainingTime: number;

  connectedFlag: boolean;
  tictacFlag: boolean;


  momentRef = moment;
  configurationECOE: Object;

  notifKey = 'soundAlert'
  
  @ViewChild('soundAlert', { read: TemplateRef, static: true }) soundAlertTemplate:TemplateRef<any>;

  constructor(
    private chronoService: ChronoService,
    private notification: NzNotificationService,
    private message: NzMessageService,
    private translate: TranslateService
    ) { }

  ngOnInit() {
    this.testSound();
  }

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
      // let's check if sound should play in the station
      const soundName = event['sound'];
      const events: [] = event['stage']['events'];
      const filteredEvent = events.filter(item => item['sound'] === soundName)[0];

      const isFromStation = (filteredEvent['stations'] as any[]).includes(this.station ? this.station.id : 0);

      if (isFromStation) {
        this.playAudio(this.event['sound'])
          .catch(() => this.testSound());
      }
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

  async playAudio(src: string, test: boolean = false) {
    if (src) {
      const audio = new Audio();
      audio.autoplay = true;
      audio.muted = test?true:false;
      audio.src = '../../../assets/sounds/' + src;
      audio.preload = 'auto';
      audio.load();
      return audio.play()
    } else {
      return 'No audio';
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

  notifSoundError(): void {

    const options: NzNotificationDataOptions = {
      nzDuration:0,
      nzKey: this.notifKey
    }
    const notif = this.notification.template(this.soundAlertTemplate, options)

    notif.onClose.subscribe(() => {
      this.testSound()
    })
  }

  closeNotifSoundError() {
    this.notification.remove();
    this.testSound();
  }

  async testSound() {
    return this.playAudio('beep_alarm.mp3', true)
    .then((v) => {
      this.message.success(this.translate.instant('SOUND_ACTIVATED'))
      return v;
    })
    .catch(error => {
      console.error(error);
      this.notifSoundError();
      return error;
    });
  }
}
