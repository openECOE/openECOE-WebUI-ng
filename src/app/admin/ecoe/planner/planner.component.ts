import { Component, OnInit } from '@angular/core';
import {ApiService} from '../../../services/api/api.service';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

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

  showAddShift: boolean = false;
  showAddRound: boolean = false;
  shiftForm: FormGroup;
  roundForm: FormGroup;

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder) {

    this.shiftForm = this.formBuilder.group({
      shift_code: ['', Validators.required],
      '$date': ['', Validators.required]
    });

    this.roundForm = this.formBuilder.group({
      description: ['', Validators.required],
      round_code: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;
    this.loadPlanner();
  }

  loadPlanner() {
    forkJoin(
      this.apiService.getResources('round', {
        where: `{"ecoe":${this.ecoeId}}`
      }),
      this.apiService.getResources('shift', {
        where: `{"ecoe":${this.ecoeId}}`
      }),
      this.apiService.getResources('station', {
        where: `{"ecoe":${this.ecoeId}}`
      })
    ).subscribe(response => {
      this.rounds = response[0];
      this.shifts = response[1];
      this.stations = response[2];
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

    console.log(this.planners);
  }

  submitFormShift() {
    const body = {
      shift_code: this.shiftForm.controls['shift_code'].value,
      time_start: {'$date': +this.shiftForm.controls['$date'].value},
      ecoe: this.ecoeId
    };

    this.apiService.createResource('shift', body).subscribe(() => {
      this.loadPlanner();
      this.closeDrawerShift();
    });
  }

  closeDrawerShift() {
    this.showAddShift = false;
    this.shiftForm.reset();
  }

  submitFormRound() {
    const body = {
      ...this.roundForm.value,
      ecoe: this.ecoeId
    };

    this.apiService.createResource('round', body).subscribe(() => {
      this.loadPlanner();
      this.closeDrawerRound();
    });
  }

  closeDrawerRound() {
    this.showAddRound = false;
    this.roundForm.reset();
  }
}
