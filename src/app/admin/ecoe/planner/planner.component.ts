import { Component, OnInit } from '@angular/core';
import {ApiService} from '../../../services/api/api.service';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {map} from 'rxjs/operators';

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
  students: any[];

  plannerSelected: { shift: number, round: number };

  showStudentsSelector: boolean = false;
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
            plannerRef: res.length > 0 ? res[0]['$uri'] : null,
            students: res.length > 0 ? res[0].students : []
          });
        });
      });

      this.planners.push({
        ...round,
        shifts: shiftsPlanner
      });
    });
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

  loadStudents(shift, round) {
    let studentsSelected = 0;
    this.apiService.getResources('student', {
      where: `{"ecoe":${this.ecoeId}}`
    }).pipe(
     map(students => {
       return students.map((student, index) => {
         const isSelected = !student.planner && studentsSelected < this.stations.length;

         if (isSelected) {
           studentsSelected++;
         }

         return {
           ...student,
           selected: isSelected
         };
       });
     })
    ).subscribe(students => {
      this.students = students;
      this.plannerSelected = {shift: shift.id, round: round.id};
      this.showStudentsSelector = true;
    });
  }

  assignPlanner() {
    const students = this.students.filter(student => student.selected).map(student => student.id);

    if (students.length === 0) {
      return;
    }

    const body = {
      ...this.plannerSelected,
      students
    };

    this.apiService.createResource('planner', body).subscribe(() => {
      this.loadPlanner();
      this.showStudentsSelector = false;
    });
  }

  deletePlanner(planner: string) {
    this.apiService.deleteResource(planner).subscribe(() => this.loadPlanner());
  }

  editPlanner(planner) {
    console.log(planner)
  }
}
