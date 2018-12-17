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

  plannerSelected: { shift: number, round: number, planner: string };

  showStudentsSelector: boolean = false;
  showAddShift: boolean = false;
  showAddRound: boolean = false;
  isEditing: { itemRef: string, edit: boolean };

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
    this.loadStations();
  }

  /**
   * Load stations by the passed ECOE.
   */
  loadStations() {
    this.apiService.getResources('station', {
      where: `{"ecoe":${this.ecoeId}}`
    }).subscribe(stations => this.stations = stations);
  }

  /**
   * Load shifts and rounds by the passed ECOE.
   * Then calls [buildPlanner]{@link #buildPlanner} function.
   */
  loadPlanner() {
    forkJoin(
      this.apiService.getResources('round', {
        where: `{"ecoe":${this.ecoeId}}`,
        sort: '{"round_code":false}'
      }),
      this.apiService.getResources('shift', {
        where: `{"ecoe":${this.ecoeId}}`,
        sort: '{"time_start":false}'
      })
    ).subscribe(response => {
      this.rounds = response[0];
      this.shifts = response[1];
      this.buildPlanner();
    });
  }

  /**
   * Builds the planner matrix structure.
   * For each round, creates an array of shifts, then loads the planner by shift and round if exists.
   */
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

  /**
   * Load students by the passed ECOE.
   * Maps the response and sets selected key to true if it has planner assigned and the reference is the same as the passed.
   * Then calls [checkStudentsSelected]{@link #checkStudentsSelected} function.
   *
   * @param {number} shiftId Id of the selected shift
   * @param {number} roundId Id of the selected round
   * @param {string} planner? Reference of the selected planner
   */
  loadStudents(shiftId: number, roundId: number, planner?: string) {
    this.students = [];
    let studentsSelected = 0;
    this.apiService.getResources('student', {
      where: `{"ecoe":${this.ecoeId}}`
    }).pipe(
      map(students => {
        return students.map(student => {
          const isSelected = (
            planner ?
              (student.planner && student.planner['$ref'] === planner) :
              (!student.planner && studentsSelected < this.stations.length)
          );

          if (!planner && isSelected) {
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
      this.plannerSelected = {shift: shiftId, round: roundId, planner};
      this.showStudentsSelector = true;

      this.isEditing = {
        itemRef: planner ? planner : '',
        edit: (typeof planner !== 'undefined')
      };

      this.checkStudentsSelected(this.students.filter(student => student.selected));
    });
  }

  assignPlanner() {
    const students = this.students.filter(student => student.selected).map(student => student.id);

    if (students.length === 0) {
      return;
    }

    const body = {
      shift: this.plannerSelected.shift,
      round: this.plannerSelected.round,
      students
    };

    const request = (
      this.plannerSelected.planner ?
        this.apiService.updateResource(this.plannerSelected.planner, body) :
        this.apiService.createResource('planner', body)
    );

    request.subscribe(() => {
      this.loadPlanner();
      this.showStudentsSelector = false;
    });
  }

  deletePlanner(planner: string) {
    this.apiService.deleteResource(planner).subscribe(() => {
      this.loadPlanner();
      this.showStudentsSelector = false;
    });
  }

  checkStudentsSelected(selection: any[]) {
    this.students = this.students.map(student => {
      return {
        ...student,
        disabled: (selection.length >= this.stations.length && !student.selected) ||
          (student.planner && !(student.planner['$ref'] === this.plannerSelected.planner))
      };
    });
  }

  submitFormShift() {
    if (!this.shiftForm.valid) {
      return;
    }

    const body = {
      shift_code: this.shiftForm.controls['shift_code'].value,
      time_start: {'$date': +this.shiftForm.controls['$date'].value},
      ecoe: this.ecoeId
    };

    const request = (
      this.isEditing.edit ?
        this.apiService.updateResource(this.isEditing.itemRef, body) :
        this.apiService.createResource('shift', body)
    );

    request.subscribe(() => {
      this.loadPlanner();
      this.closeModalShift();
    });
  }

  closeModalShift() {
    this.showAddShift = false;
    this.shiftForm.reset();
  }

  deleteShift(shift: string) {
    this.apiService.deleteResource(shift).subscribe(() => {
      this.loadPlanner();
      this.closeModalShift();
    });
  }

  addShift(shift?: any) {
    this.showAddShift = true;

    if (shift) {
      this.shiftForm.setValue({shift_code: shift.shift_code, '$date': new Date(shift.time_start['$date'])});
    }

    this.isEditing = {
      itemRef: shift ? shift['$uri'] : '',
      edit: (typeof shift !== 'undefined')
    };
  }

  submitFormRound() {
    if (!this.roundForm.valid) {
      return;
    }

    const body = {
      ...this.roundForm.value,
      ecoe: this.ecoeId
    };

    const request = (
      this.isEditing.edit ?
        this.apiService.updateResource(this.isEditing.itemRef, body) :
        this.apiService.createResource('round', body)
    );

    request.subscribe(() => {
      this.loadPlanner();
      this.closeModalRound();
    });
  }

  closeModalRound() {
    this.showAddRound = false;
    this.roundForm.reset();
  }

  deleteRound(round: string) {
    this.apiService.deleteResource(round).subscribe(() => {
      this.loadPlanner();
      this.closeModalRound();
    });
  }

  addRound(round?: any) {
    this.showAddRound = true;

    if (round) {
      this.roundForm.setValue({description: round.description, round_code: round.round_code});
    }

    this.isEditing = {
      itemRef: round ? round['$uri'] : '',
      edit: (typeof round !== 'undefined')
    };
  }
}
