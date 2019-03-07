import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../../../services/api/api.service';
import {Subscription} from 'rxjs';

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
  private stages: any[];
  private schedules: any[];
  private events: any[];

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
    this.api.getResources('schedule', {
      where: `{"ecoe":${this.ecoeId}}`
    }).subscribe(response => {
      this.stages = response;
    });
  }

  createSchedule(): void {

  }

  updateSchedule(): void {

  }

  deleteSchedule(): void {

  }

  getStages(): void {
    this.api.getResources('stage', {
      where: `{"ecoe":${this.ecoeId}}`
    }).subscribe(response => {
      this.stages = response;
    });
  }

  createStage(): void {

  }

  updateStage(): void {

  }

  deleteStage(): void {

  }

}
