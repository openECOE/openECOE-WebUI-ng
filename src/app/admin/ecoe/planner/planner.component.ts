import { Component, OnInit } from '@angular/core';
import {ApiService} from '../../../services/api/api.service';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.less']
})
export class PlannerComponent implements OnInit {

  ecoeId: number;
  shifts: any[];
  rounds: any[];
  planners: any[];
  stations: any[];

  constructor(private apiService: ApiService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;
    this.loadPlanner();
    this.loadStations();
  }

  loadStations() {
    this.apiService.getResources('station', {
      where: `{"ecoe":${this.ecoeId}}`
    }).subscribe(response => this.stations = response);
  }

  loadPlanner() {
    forkJoin(
      this.apiService.getResources('round', {
        where: `{"ecoe":${this.ecoeId}}`
      }),
      this.apiService.getResources('shift', {
        where: `{"ecoe":${this.ecoeId}}`
      })
    ).subscribe(response => {
      this.rounds = response[0];
      this.shifts = response[1];

      this.buildPlanner();
    });

  }

  buildPlanner() {
    this.planners = [];

    this.rounds.forEach(round => {
      const shiftsPlanner = [];
      this.shifts.forEach(shift => {
        this.apiService.getResources('planner', {
          where: `{"round":${round.id},"shift":${shift.id}}`
        }).subscribe(res => {
          // console.log(round.id, shift.id, res);
          shiftsPlanner.push({
            ...shift,
            planner_assigned: res.length > 0,
            students: res.length > 0 ? res[0].students : []
          });
        });
      });

      this.planners.push({
        ...round,
        shifts: shiftsPlanner
      });
    });

    console.log(this.planners)
  }
}
