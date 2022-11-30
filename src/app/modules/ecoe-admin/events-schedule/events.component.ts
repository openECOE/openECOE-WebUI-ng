import {Component, Input, OnInit} from '@angular/core';
import {Event, Schedule} from '@app/models/schedule';
import {Station} from '@app/models';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SharedService} from '@services/shared/shared.service';
import {Item, Pagination} from '@openecoe/potion-client';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.less']
})
export class EventsComponent implements OnInit {

  @Input() schedule: Schedule;

  validateFormEvent: FormGroup;

  stageDuration: { minutes: number, seconds: number } = {minutes: 0, seconds: 0};
  maxDuration: { minutes: number, seconds: number } = {minutes: 0, seconds: 0};

  modalEvent: boolean = false;


  editCache: { [key: number]: any } = {};

  mapOfSort: { [key: string]: any } = {
    text: null,
    time: 'ascend'
  };

  sortName: string | null = 'time';
  sortValue: string | null = 'ascend';

  listOfData: Array<Event> = [];
  listOfDisplayData: Array<Event> = [];

  listOfStation: Array<Station>;

  soundsLocation: string = 'assets/sounds/';
  audioType: string = 'audio/mpeg';

  noSound: any = {description: 'NO_SOUND', file: null};

  defaultSounds: Array<{ description: string, file: string }> = [
    {description: 'Alarma', file: 'beep_alarm.mp3'},
    {description: 'Entre estación', file: 'entrar.mp3'},
    {description: 'Quedan 3 minutos', file: 'aviso_3_min.mp3'},
    {description: 'Salga estación', file: 'salir.mp3'},
    this.noSound
  ];

  loading: boolean = false;

  constructor(public shared: SharedService,
              private fb: FormBuilder,
  ) {
    this.validateFormEvent = this.fb.group({
      eventTimeMin: [0, [Validators.required]],
      eventTimeSec: [0, [Validators.required]],
      eventCountdown: [false],
      eventText: [null, [Validators.required]],
      eventSound: [null],
      eventStation: [null]
    });
  }

  ngOnInit() {
    this.loading = true;
    this.stageDuration = this.shared.toMinutesSeconds(this.schedule.stage.duration);

    // TODO: Change max duration when stage parent changes
    this.maxDuration.minutes = this.stageDuration.minutes;
    this.maxDuration.seconds = this.stageDuration.seconds;

    this.getEvents(this.schedule).then(events => {
      this.listOfData = [...events];

      this.getStationEvents()
        .then(stageSchedules => {
          this.listOfData = [
            ...this.listOfData, ...stageSchedules
          ];

          this.listOfDisplayData = [
            ...this.listOfData
          ];

          this.reorderEvents();
          this.updateEditCache();
          this.loading = false;
        });
    });

    console.log('Init Finish');
  }

  async getEvents(schedule: Schedule) {
    const pagGeneralEvents: Pagination<Event> = await schedule.events({}, {paginate: true});
    let eventsData = [...pagGeneralEvents['items']];

    for (let i = 2; i <= pagGeneralEvents.pages; i++) {
      eventsData = [...this.listOfData, (await pagGeneralEvents.changePageTo(i)).items];
    }

    return eventsData;
  }

  refreshEvents(): void {
    this.loading = true;
    const query = {
      where: {schedule: this.schedule},
    };

    Event.query(query, {cache: false})
      .then(value => {
        // @ts-ignore
        this.listOfData = value;
      })
      .catch(reason => console.log(reason))
      .finally(() => this.loading = false);


  }

  getStationEvents(): Promise<any> {
    const query = {
      where: {stage: this.schedule.stage.id, station: {$ne: null}}
    };

    return new Promise((resolve, reject) => {
      Schedule.query<Schedule>(query)
        .then(async schedules => {
          let stationEvents: Array<Event> = [];

          await Promise.all(schedules.map((itemSchedule) =>
              this.getEvents(itemSchedule).then(value => {
                stationEvents = [...stationEvents, ...value];
              })
            )
          );

          console.log('Station Events', stationEvents);
          resolve(stationEvents);
        })
        .catch(reason => reject(reason));
    });
  }

  getStations(): Promise<any> {
    const query = {
      where: {ecoe: this.schedule.ecoe},
      sort: {order: false, name: false}
    };

    return Station.query(query)
      .then(stations => {
        // @ts-ignore
        this.listOfStation = stations;
      });
  }

  createEvent(schedule: Schedule,
              time: number,
              is_countdown: boolean,
              text: string,
              sound: string,
  ): void {
    const event = new Event();
    event.schedule = schedule;
    event.time = time;
    event.isCountdown = is_countdown;
    event.text = text;
    event.sound = sound;
    this.saveEvent(event)
      .then(value => {
        this.listOfData = [...this.listOfData, value];
        this.reorderEvents();
        this.updateEditCache();
        console.log('create event:', value);
      });
  }

  createEventStation(schedule: Item,
                     idStation: number,
                     time: number,
                     is_countdown: boolean,
                     text: string,
                     sound: string,
  ): void {
    const query = {
      where: {stage: this.schedule.stage.id, station: idStation}
    };

    Schedule.first(query)
      .then(firstSchedule => {

        if (firstSchedule) {
          // @ts-ignore
          this.createEvent(firstSchedule, time, is_countdown, text, sound);
        } else {
          const itemSchedule = new Schedule();

          itemSchedule.stage = this.schedule.stage;
          itemSchedule.ecoe = this.schedule.ecoe;
          itemSchedule.station = idStation;
          itemSchedule.save()
            .then(newSchedule => {
              this.createEvent(newSchedule, time, is_countdown, text, sound);
            })
            .catch(reason => {
              console.error(reason);
            });
        }
      })
      .catch(reason => {
        console.log(reason);
      });
  }

  saveEvent(event: Event): Promise<any> {
    return event.save()
      .then(value => {
        console.log('save event:', event);
        return value;
      })
      .catch(reason => console.log('error create event:', reason));
  }

  updateEvent(event: Event): Promise<any> {
    return this.saveEvent(event)
      .then(value => {
        this.reorderEvents();
        this.updateItemCache(event);
        console.log('update event:', value, this.listOfData);
      });
  }

  deleteEvent(event: Event): Promise<any> {
    return event.destroy()
      .then(() => {
        console.log('delete event:', event);
        this.listOfDisplayData = this.listOfData = this.listOfData.filter(x => x.id !== event.id);
        this.reorderEvents();
      })
      .catch(reason => console.log('error delete event:', reason));
  }

  showModalEvent(): void {
    this.getStations().then(() => this.modalEvent = true);
  }

  handleStageCancel(): void {
    this.modalEvent = false;
    this.cleanForm(this.validateFormEvent);
  }

  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: number): void {
    const index = this.listOfData.findIndex(item => item.id === id);
    this.updateItemCache(this.listOfData[index]);
  }

  saveEdit(id: number): void {
    const index = this.listOfData.findIndex(item => item.id === id);
    const event = this.listOfData[index];
    const cache = this.editCache[id];

    cache.data.time = this.shared.toSeconds(cache.timeSplit.minutes, cache.timeSplit.seconds);
    Object.assign(event, cache.data);
    this.updateEvent(event)
      .then(() => cache.edit = false);
  }

  updateEditCache(): void {
    this.listOfData.forEach(item => {
      this.updateItemCache(item);
    });
  }

  updateItemCache(item: Event): void {
    this.editCache[item.id] = {
      edit: false,
      timeSplit: this.shared.toMinutesSeconds(item.time),
      soundItem: this.getAudioDescription(item.sound),
      data: {...item}
    };
  }

  playAudio(audioInput: HTMLAudioElement): void {
    audioInput.play()
      .then(value => console.log('playAudio: ', audioInput.currentSrc, value))
      .catch(reason => console.log('[ERROR] playAudio: ', reason));
  }

  getAudioDescription(audioFile: string): { description: string, file: string } {
    const sound = this.defaultSounds.find(item => item.file === audioFile);

    return sound ? sound : this.noSound;
  }

  checkEventTime(inputMinutes: any, inputSeconds: any) {
    console.log('checkEventTime', inputMinutes.value, inputSeconds.value);

    if (inputMinutes.value === this.stageDuration.minutes) {
      if (inputSeconds.value > this.stageDuration.seconds) {
        inputSeconds.setValue(this.stageDuration.seconds);
        this.maxDuration.seconds = this.stageDuration.seconds;
      }
    } else {
      this.maxDuration.seconds = 59;
    }
  }

  checkEditTime(id: number) {
    const cache = this.editCache[id];

    console.log('checkEventTime', cache.timeSplit.minutes, cache.timeSplit.seconds);

    if (cache.timeSplit.minutes === this.stageDuration.minutes) {
      if (cache.timeSplit.seconds > this.stageDuration.seconds) {
        cache.timeSplit.seconds = this.stageDuration.seconds;
      }
    } else {
      this.maxDuration.seconds = 59;
    }
  }

  submitFormStage($event: any, value: any) {
    $event.preventDefault();
    for (const key of Object.keys(this.validateFormEvent.controls)) {
      this.validateFormEvent.controls[key].markAsDirty();
      this.validateFormEvent.controls[key].updateValueAndValidity();
    }
    console.log(value);

    const eventSeconds = this.shared.toSeconds(value.eventTimeMin, value.eventTimeSec);

    if (value.eventStation) {
      value.eventStation.forEach(idStation => {
        this.createEventStation(this.schedule, idStation, eventSeconds, value.eventCountdown, value.eventText, value.eventSound);
      });
    } else {
      this.createEvent(this.schedule, eventSeconds, value.eventCountdown, value.eventText, value.eventSound);
    }

    this.handleStageCancel();
  }

  resetForm(e: MouseEvent, form: FormGroup): void {
    e.preventDefault();
    this.cleanForm(form);
  }

  cleanForm(form: FormGroup): void {
    form.reset();
    for (const key of Object.keys(form.controls)) {
      form.controls[key].markAsPristine();
      form.controls[key].updateValueAndValidity();
    }
  }

  sort(sort: { key: string; value: string }): void {
    this.sortName = sort.key;
    this.sortValue = sort.value;
    this.search();
  }


  search(): void {
    const data = [...this.listOfData];

    /** sort data **/
    if (this.sortName && this.sortValue) {
      this.listOfDisplayData = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortName] > b[this.sortName]
          ? 1
          : -1
          : b[this.sortName] > a[this.sortName]
          ? 1
          : -1
      );
    } else {
      this.listOfDisplayData = data;
    }
  }

  reorderEvents(): void {
    const sort: { key: string; value: string } = {key: this.sortName, value: this.sortValue};
    this.sort(sort);
  }
}
