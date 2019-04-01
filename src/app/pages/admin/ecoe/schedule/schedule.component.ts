import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {Schedule} from '../../../../models/schedule';
import {Stage, Event} from '../../../../models/schedule';
import {ECOE} from '../../../../models/ecoe';
import {FormGroup, FormControl, ValidationErrors, Validators, FormBuilder} from '@angular/forms';
import {Observable, Observer} from 'rxjs';

/**
 * Component schedule to configure stages and events.
 */
@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.less']
})
export class ScheduleComponent implements OnInit {

  private ecoeId: number;
  private ecoe: any;
  private subscriptions: Subscription [] = [];
  public schedules: any[];
  public loading: boolean = false;
  public new_item: boolean = false;

  private modalStage: boolean = false;
  private modalEvent: boolean = false;

  private editStage: boolean = false;

  private editStageMin: number = 0;
  private editStageSec: number = 0;

  private tabIndex: number;

  public editCache = {};

  validateFormStage: FormGroup;

  submitFormStage = ($event: any, value: any) => {
    $event.preventDefault();
    for (const key in this.validateFormStage.controls) {
      this.validateFormStage.controls[key].markAsDirty();
      this.validateFormStage.controls[key].updateValueAndValidity();
    }
    console.log(value);

    const stageDuration = this.toSeconds(value.stageDurationMin, value.stageDurationSec);

    this.createSchedule(value.stageName, stageDuration);
    this.handleStageCancel();
  };

  resetForm(e: MouseEvent, form: FormGroup): void {
    e.preventDefault();
    this.cleanForm(form);
  }

  cleanForm(form: FormGroup): void {
    form.reset();
    for (const key in form.controls) {
      form.controls[key].markAsPristine();
      form.controls[key].updateValueAndValidity();
    }
  }

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
  ) {

    this.validateFormStage = this.fb.group({
      stageName: ['', [Validators.required]],
      stageDurationMin: ['', [Validators.required]],
      stageDurationSec: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;
    ECOE.fetch(this.ecoeId)
      .then(value => {
        this.ecoe = value;
        this.getSchedules();
      })
      .catch(reason => console.log(reason));
  }

  updateEditCache() {
    this.schedules.map(item => {
      this.editCache[item.id] = {edit: this.editCache[item.id] ? this.editCache[item.id].edit : false, ...item};
    });
  }

  startEditStage(item: any): void {
    const duration = this.toMinutesSeconds(item.stage.duration);
    this.editStageMin = duration.minutes;
    this.editStageSec = duration.seconds;

    this.editStage = true;
  }

  /**
   * Sets the edit variable to false.
   *
   * @param {any} item Resource selected
   */
  cancelEditStage(): void {
    this.editStage = false;
  }

  getSchedules(): void {
    this.loading = true;
    const query = {
      where: {'ecoe': this.ecoeId}
    };

    Schedule.query(query)
      .then((schedule) => {
        this.schedules = schedule;
        console.log(this.schedules);
        this.loading = false;
      })
      .catch((err) => {
        console.log('error', err);
        this.loading = false;
      });
  }

  createSchedule(name: string, duration: number) {

    const stage = new Stage();
    stage.duration = duration;
    stage.name = name;
    stage.order = this.schedules.length;
    stage.save()
      .then(new_stage => {
        console.log('stage save', new_stage);
        const schedule = new Schedule();
        schedule.stage = new_stage;
        schedule.ecoe = this.ecoe;
        schedule.save()
          .then(ret_schedule => {
            console.log('schedule save', ret_schedule);
            this.schedules = [...this.schedules, ret_schedule];
          })
          .catch(reason => {
            console.log('error', reason);
            new_stage.destroy().catch(reason1 => console.log('delete Stage error:', reason1));
          });
      })
      .catch(reason => console.log('error', reason));
  }

  deleteSchedule(item: Schedule): void {
    if (item.events) {
      item.events.map(event => event.destroy()
        .catch(reason => console.log('delete Event error:', reason)));
    }
    item.destroy()
      .then(() => {
        item.stage.destroy()
          .then(() => this.schedules = this.schedules.filter(x => x.id !== item.id))
          .catch(reason => console.log('delete Stage error:', reason));
      })
      .catch(reason => console.log('delete Schedule error:', reason));


  }

  /* tslint:disable-next-line:no-any */
  log(args: any[]): void {
    console.log(args);
  }

  onDeselectTabStage(): void {
    this.cancelEditStage();
  }

  createStage(): void {

  }

  updateStage(): void {

  }

  deleteStage(): void {

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
    event.is_countdown = is_countdown;
    event.text = text;
    event.sound = sound;
    event.save()
      .then(value => console.log('create event:', event))
      .catch(reason => console.log('error event:', reason));
  }

  updateEvent(): void {

  }

  deleteEvent(): void {

  }

  showStageModal(): void {
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
    schedule.stage.duration = this.toSeconds(this.editStageMin, this.editStageSec);
  }

  toSeconds(minutes: number, seconds: number): number {
    return (minutes * 60) + seconds;
  }

  toMinutesSeconds(seconds: number): {minutes: number, seconds: number} {
    const min: number = Math.floor(seconds / 60);
    const sec: number = (seconds - min * 60);
    return {minutes: min, seconds: sec};
  }

}
