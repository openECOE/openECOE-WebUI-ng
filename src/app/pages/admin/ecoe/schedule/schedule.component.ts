import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../../../services/api/api.service';
import {Subscription} from 'rxjs';
import {Schedule} from '../../../../models/schedule';
import {Stage} from '../../../../models/schedule';
import {ECOE} from '../../../../models/ecoe';

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

  public editCache = {};

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {
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

  startEdit(item: any): void {
    this.editCache[item.id].edit = true;
  }

  /**
   * Sets the edit variable to false.
   *
   * @param {any} item Resource selected
   */
  cancelEdit(item: any): void {
    this.editCache[item.id].edit = false;
    this.new_item = false;
    if (item.id == null) {
      //  not saved, cancel the schedule
      this.schedules = this.schedules.filter(x => x.id !== item.id);
    }
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
        this.updateEditCache();
        this.loading = false;
      })
      .catch((err) => {
        console.log('error', err);
        this.loading = false;
      });
  }

  createSchedule(): void {
    // this.loading = true;
    const stage = new Stage();
    stage.duration = 0;
    stage.name = '';
    stage.order = this.schedules.length;
    console.log('stage', stage);

    const schedule = new Schedule();
    schedule.stage = stage;
    schedule.ecoe = this.ecoe;

    console.log('schedule', schedule);

    this.schedules = [...this.schedules, schedule];

    this.updateEditCache();

    this.new_item = this.editCache[schedule.id].new_item = this.editCache[schedule.id].edit = true;
    // this.loading = false;
  }

  saveSchedule(item: Schedule): void {
    item.stage.save()
      .then(new_stage => {
        console.log('stage save', new_stage);
        item.stage = new_stage;
        item.save()
          .then(ret_schedule => {
            item = ret_schedule;
            console.log('schedule save', ret_schedule);
            this.updateEditCache();
          })
          .catch(reason => console.log('error', reason))
          .finally(() => this.cancelEdit(item));
      })
      .catch(reason => console.log('error', reason));
  }

  deleteSchedule(item: Schedule): void {
    item.events.map(event => event.destroy().catch(reason => console.log('delete Event error:', reason)));
    item.destroy().catch(reason => console.log('delete Schedule error:', reason));
    item.stage.destroy().catch(reason => console.log('delete Stage error:', reason));
    this.schedules = this.schedules.filter(x => x.id !== item.id);
  }

  createStage(): void {

  }

  updateStage(): void {

  }

  deleteStage(): void {

  }

}
