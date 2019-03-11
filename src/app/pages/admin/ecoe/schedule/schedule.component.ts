import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../../../services/api/api.service';
import {Subscription} from 'rxjs';
import {Schedule} from '../../../../models/schedule';

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
  private subscriptions: Subscription [] = [];
  private schedules: any[];

  private editCache = {};

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {
  }

  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;
    this.getSchedules();
  }

  getSchedules(): void {
    const query = {
      where: {'ecoe': this.ecoeId}
    };

    Schedule.query(query)
      .then((schedule) => {
        this.schedules = schedule;
        console.log(this.schedules);
      });
  }

  createSchedule(): void {

  }

  updateSchedule(): void {

  }

  deleteSchedule(): void {

  }

  getStages(): void {

  }

  createStage(): void {

  }

  updateStage(): void {

  }

  deleteStage(): void {

  }

}
