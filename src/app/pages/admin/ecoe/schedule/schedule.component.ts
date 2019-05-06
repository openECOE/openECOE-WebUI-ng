import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {Schedule} from '../../../../models/schedule';
import {Stage, Event} from '../../../../models/schedule';
import {ECOE} from '../../../../models/ecoe';
import {FormGroup, FormControl, ValidationErrors, Validators, FormBuilder} from '@angular/forms';
import {Observable, Observer} from 'rxjs';
import {SharedService} from '../../../../services/shared/shared.service';
import {TranslateService} from '@ngx-translate/core';

/**
 * Component schedule to configure stages and events.
 */
@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.less']
})
export class ScheduleComponent implements OnInit {

  ecoeId: number;
  ecoe: any;
  subscriptions: Subscription [] = [];
  schedules: any[];
  loading: boolean = false;
  new_item: boolean = false;

  modalStage: boolean = false;
  modalEvent: boolean = false;

  editStage: boolean = false;

  editStageMin: number = 0;
  editStageSec: number = 0;

  tabIndex: number;

  editCache = {};

  validateFormStage: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private shared: SharedService,
    private translate: TranslateService
  ) {

    this.validateFormStage = this.fb.group({
      stageName: ['', [Validators.required]],
      stageDurationMin: ['', [Validators.required]],
      stageDurationSec: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.loading = true;
    this.ecoeId = +this.route.snapshot.params.id;
    ECOE.fetch(this.ecoeId)
      .then(value => {
        this.ecoe = value;
        this.getSchedules();
      })
      .catch(reason => console.log(reason))
      .finally(() => this.loading = false);
  }

  updateEditCache() {
    this.schedules.map(item => {
      this.editCache[item.id] = {edit: this.editCache[item.id] ? this.editCache[item.id].edit : false, ...item};
    });
  }

  startEditStage(item: any): void {
    const duration = this.shared.toMinutesSeconds(item.stage.duration);
    this.editStageMin = duration.minutes;
    this.editStageSec = duration.seconds;

    this.editStage = true;
  }

  /**
   * Sets the edit variable to false.
   *
   * @param item Resource selected
   */
  cancelEditStage(item: Schedule): void {
    item.stage.save()
      .catch(reason => console.log('delete Stage error:', reason));
    this.editStage = false;
  }

  interchangeOrder(sched1: Schedule, sched2: Schedule): void {
    const order1 = sched1.stage.order;
    const order2 = sched2.stage.order;

    sched1.stage.order = order2;
    sched2.stage.order = order1;

    sched1.stage.save()
      .then(() => {
        sched2.stage.save()
          .then(() => {
            this.schedules = this.orderSchedules(this.schedules);
          });
      });
  }

  getSchedules(): void {
    this.loading = true;
    const query = {
      where: {'ecoe': this.ecoeId, 'station': null}
    };

    Schedule.query(query)
      .then((schedule) => {
        // @ts-ignore
        this.schedules = this.orderSchedules(schedule);
        console.log(this.schedules);
        this.loading = false;
      })
      .catch((err) => {
        console.log('error', err);
        this.loading = false;
      });
  }

  orderSchedules(schedules: Schedule[]): Schedule[] {
    // @ts-ignore
    return schedules.sort((a, b) => a.stage.order > b.stage.order);
  }

  createSchedule(name: string, duration: number) {

    const stage = new Stage();
    stage.duration = duration;
    stage.name = name;
    this.schedules.length === 0 ? stage.order = 0 : stage.order = (this.schedules[this.schedules.length - 1].stage.order) + 1;
    stage.save()
      .then(new_stage => {
        console.log('stage save', new_stage);
        const schedule = new Schedule();
        schedule.stage = new_stage;
        schedule.ecoe = this.ecoe;
        schedule.save()
          .then(ret_schedule => {
            console.log('schedule save', ret_schedule);
            // Create Start and Finish Events
            this.createDefaultEvents(ret_schedule)
              .then(value => {
                this.schedules = [...this.schedules, ret_schedule];
                this.tabIndex = this.schedules.length;
              });
          })
          .catch(reason => {
            console.log('error', reason);
            new_stage.destroy().catch(reason1 => console.log('delete Stage error:', reason1));
          });
      })
      .catch(reason => console.log('error', reason));
  }

  createDefaultEvents(schedule: Schedule): Promise<any> {
    const eventStart = new Event();
    eventStart.schedule = schedule;
    eventStart.time = 0;
    eventStart.isCountdown = false;
    eventStart.sound = null;
    eventStart.text = this.translate.instant('START');

    const eventFinish = new Event();
    eventFinish.schedule = schedule;
    eventFinish.time = schedule.stage.duration;
    eventFinish.isCountdown = false;
    eventFinish.sound = null;
    eventFinish.text = this.translate.instant('END');

    const saveStart = eventStart.save()
      .then(value => {
        console.log('eventStart Created', value);
        schedule.events = [...schedule.events, value];
      })
      .catch(reason => console.error(reason));

    const saveFinish = eventFinish.save()
      .then(value => {
        console.log('eventFinish Created', value);
        schedule.events = [...schedule.events, value];
      })
      .catch(reason => console.error(reason));

    return Promise.all([saveStart, saveFinish]);
  }


  deleteStage(item: Schedule): void {
    const query = {
      where: {stage: item.stage.id}
    };

    let promises = [];

    Schedule.query(query)
      .then(itemsSchedule => {
        itemsSchedule.forEach(retSchedule => {
          // @ts-ignore
          promises = [...promises, this.deleteSchedule(retSchedule)];
        });

        Promise.all(promises)
          .then(() => {
            item.stage.destroy()
              .then(() => {
                console.log('[DELETE] Stage', item.stage);
                this.schedules = this.schedules.filter(x => x.id !== item.id);
              })
              .catch(reason => console.log('delete Stage error:', reason));
          });
      });
  }

  deleteSchedule(schedule: Schedule): Promise<any> {
    if (schedule.events) {
      schedule.events.forEach(event => event.destroy()
        .then(value => console.log('[DELETE] Event', event))
        .catch(reason => console.error('delete Event error:', reason))
      );
    }

    return schedule.destroy()
      .then(() => {
        console.log('[DELETE] Schedule', schedule);
      })
      .catch(reason => console.log('delete Schedule error:', reason));
  }

  onDeselectTabStage(schedule: Schedule): void {
    if (this.editStage) {
      this.cancelEditStage(schedule);
    }
  }

  showModalStage(): void {
    this.modalStage = true;
  }

  handleStageOk(): void {
    console.log('Button ok clicked!');
    this.modalStage = false;
  }

  handleStageCancel(): void {
    console.log('Button cancel clicked!');
    this.modalStage = false;
    this.cleanForm(this.validateFormStage);
  }

  inputToSeconds(schedule: Schedule): void {
    schedule.stage.duration = this.shared.toSeconds(this.editStageMin, this.editStageSec);
  }

  submitFormStage = ($event: any, value: any) => {
    $event.preventDefault();
    for (const key of Object.keys(this.validateFormStage.controls)) {
      this.validateFormStage.controls[key].markAsDirty();
      this.validateFormStage.controls[key].updateValueAndValidity();
    }
    console.log(value);

    const stageDuration = this.shared.toSeconds(value.stageDurationMin, value.stageDurationSec);

    this.createSchedule(value.stageName, stageDuration);
    this.handleStageCancel();
  };

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

}
