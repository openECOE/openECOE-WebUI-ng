import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../../services/api/api.service';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, from} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {map} from 'rxjs/operators';
import {ECOE, Station, Student} from '../../../../models/ecoe';
import {Planner, Round, Shift} from '../../../../models/planner';
import {Item} from '@infarm/potion-client';

/**
 * Component with the relations of rounds and shifts to create plannersMatrix.
 */
@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.less']
})
export class PlannerComponent implements OnInit {

  ecoeId: number;
  ecoe: ECOE | Item;

  shifts: any[] = [];
  rounds: any[] = [];
  plannerRounds: any[] = [];
  stations: any[] = [];
  listStudents: any[] = [];

  displayRoundData: { round: Round, shiftPlanners: Planner[] };

  plannerSelected: { shift: Shift, round: Round, planner: Planner };

  plannerMatrix: any[][];

  showStudentsSelector: boolean = false;
  showAddShift: boolean = false;
  showAddRound: boolean = false;
  isEditing: { itemRef: any, edit: boolean };

  shiftForm: FormGroup;
  roundForm: FormGroup;

  loading: boolean = false;

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder) {

    this.shiftForm = this.formBuilder.group({
      shift_code: ['', Validators.required],
      time_start: ['', Validators.required]
    });

    this.roundForm = this.formBuilder.group({
      description: ['', Validators.required],
      round_code: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loading = true;

    this.ecoeId = +this.route.snapshot.params.id;
    ECOE.fetch(this.ecoeId)
      .then(value => {
        this.ecoe = value;
        this.loadPlanner();
        this.loadStations();
      })
      .finally(() => this.loading = false);
  }

  /**
   * Save the planner passed and fill student planner_order.
   *
   * @param planner Reference of the Planner
   */
  savePlanner(planner: Planner | Item): Promise<any> {
    return planner.save()
      .then(savedPlanner => {
        console.log('Planner created', savedPlanner);

        // planner.students.forEach((student, index) => {
        //   student.plannerOrder = index + 1;
        //   student.save()
        //     .then(value => console.log('Student assigned to planner', value, savedPlanner)
        //     );
        // });
      })
      .catch(reason => console.error('Planner create error', reason));
  }

  /**
   * Create the planner for round and shift.
   * Optionally you can pass a listStudents Array to load
   *
   * @param round Reference of the round
   * @param shift Reference of the shift
   * @param students Array of listStudents to link with the planner
   */
  createPlanner(round: any, shift: any, students?: Student[]): Promise<any> {
    return this.updatePlanner(new Planner(), round, shift, students);
  }

  /**
   * Update the planner passed.
   *
   * @param planner Reference of the selected planner
   * @param round Reference of the round
   * @param shift Reference of the shift
   * @param students Array of listStudents to link with the planner
   */
  updatePlanner(planner: any, round: any, shift: any, students?: Student[]): Promise<void> {
    planner.round = round.$id;
    planner.shift = shift.$id;
    planner.students = students;

    return this.savePlanner(planner);
  }

  /**
   * Delete the planner passed.
   * Then reloads all plannersMatrix and hides the modal.
   *
   * @param planner Reference of the selected planner
   */
  deletePlanner(planner: Planner): Promise<any> {
    return planner.destroy()
      .then(value => {
        this.loadPlanner();
        this.showStudentsSelector = false;
        console.log('Planner deleted', value);
      });
  }

  saveRound(round: Round | Item): Promise<any> {
    return round.save()
      .then(value => console.log('Round Saved', value))
      .catch(reason => console.error('Round Saving Error', reason));
  }

  createRound(round_code: string, description: string): Promise<void> {
    return this.updateRound(new Round(), round_code, description);
  }

  updateRound(round: Round, round_code: string, description: string): Promise<void> {
    round.ecoe = this.ecoeId;
    round.round_code = round_code;
    round.description = description;

    return this.saveRound(round);
  }

  /**
   * Delete the round passed and all Planners linked.
   *
   * @param round Reference of the selected round
   */
  deleteRound(round: Round): Promise<void> {
    return new Promise((resolve, reject) => {
      const promises = [];

      // Delete all planners linked
      round.planners.forEach(planner => {
        promises.push(this.deletePlanner(planner));
      });

      Promise.all(promises)
        .then(() => {
          round.destroy()
            .then(value => {console.log('Round deleted', value); resolve(value); })
            .catch(reason => reject(reason));
        });
    });


  }

  saveShift(shift: Shift | Item): Promise<any> {
    return shift.save()
      .then(value => console.log('Shift Saved', value))
      .catch(reason => console.error('Shift Saving Error', reason));
  }

  createShift(shift_code: string, time_start: Date): Promise<void> {
    return this.updateShift(new Shift(), shift_code, time_start);
  }

  updateShift(shift: Shift, shift_code: string, time_start: Date): Promise<void> {
    shift.ecoe = this.ecoeId;
    shift.shift_code = shift_code;
    shift.timeStart = time_start;

    return this.saveShift(shift);
  }

  /**
   * Delete the shift passed and all Planners linked.
   *
   * @param shift Reference of the selected Shift
   */
  deleteShift(shift: Shift): Promise<void> {
    return new Promise((resolve, reject) => {
      const promises = [];

      // Delete all planners linked
      shift.planners.forEach(planner => {
        promises.push(this.deletePlanner(planner));
      });

      Promise.all(promises)
        .then(() => {
          shift.destroy()
            .then(value => {console.log('Shift deleted', value); resolve(value); })
            .catch(reason => reject(reason));
        });
    });


  }

  /**
   * Load stations by the passed ECOE.
   */
  loadStations() {
    Station.query(
      {where: {ecoe: this.ecoeId}}
    ).then(stations => this.stations = stations);
  }

  /**
   * Load shifts and rounds by the passed ECOE.
   * Then calls [buildPlanner]{@link #buildPlanner} function.
   */
  loadPlanner() {
    forkJoin(
      from(Round.query({
          where: {'ecoe': this.ecoeId},
          sort: {'round_code': false}
        })
      ),
      from(Shift.query({
          where: {'ecoe': this.ecoeId},
          sort: {'time_start': false}
        })
      )
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
    this.plannerRounds = [];

    this.rounds.forEach(round => {
      const shiftsPlanner = [];
      this.shifts.forEach(shift => {
        Planner.first({
          where: {'round': round, 'shift': shift}
        }).then(planner => {
          const plannerValues = planner ?
            {planner_assigned: true, plannerRef: planner, students: planner.students} :
            {planner_assigned: false, plannerRef: null, students: null};

          shiftsPlanner.push({
            data: shift,
            ...plannerValues
          });
        });
      });

      this.plannerRounds.push({
        round: round,
        shifts: shiftsPlanner
      });
    });
  }

  /**
   * Load listStudents by the passed ECOE.
   * Maps the response and sets selected key to true if it has planner assigned and the reference is the same as the passed.
   * Then calls [checkStudentsSelected]{@link #checkStudentsSelected} function.
   *
   * @param shift Id of the selected shift
   * @param round Id of the selected round
   * @param planner? Reference of the selected planner
   */
  loadStudents(shift: Shift, round: Round, planner?: Planner) {
    this.listStudents = [];
    let studentsSelected = 0;

    from(Student.query({where: {'ecoe': this.ecoeId}}))
      .pipe(
        map(students => {
          return students.map(student => {
            const isSelected = (
              planner ?
                (student.planner && student.planner === planner) :
                (!student.planner && studentsSelected < this.stations.length)
            );

            if (!planner && isSelected) {
              studentsSelected++;
            }

            return {
              data: student,
              selected: isSelected
            };
          });
        })
      ).subscribe(students => {
      this.listStudents = students;
      this.plannerSelected = {shift: shift, round: round, planner: planner};
      this.showStudentsSelector = true;

      this.isEditing = {
        itemRef: planner ? planner : null,
        edit: (typeof planner !== 'undefined')
      };

      this.checkStudentsSelected(this.listStudents.filter(student => student.selected));
    });
  }

  /**
   * Creates or updates the planner selected.
   * Then reloads all plannersMatrix and hides the modal.
   */
  assignPlanner() {
    const students = this.listStudents
      .filter(student => student.selected)
      .map(student => student.data);

    if (students.length === 0) {
      return;
    }

    const request = (
      this.plannerSelected.planner ?
        this.updatePlanner(
          this.plannerSelected.planner,
          this.plannerSelected.round,
          this.plannerSelected.shift,
          students)
        :
        this.createPlanner(this.plannerSelected.round, this.plannerSelected.shift, students)
    );

    request.then(() => {
      this.loadPlanner();
      this.showStudentsSelector = false;
    });

  }

  /**
   * Modifies the listStudents array and sets the disabled property to true if the selection length is equal or higher
   * than the number of stations and the student is not selected,
   * or if the student has a planner assigned and this planner is not the same as the selected.
   * @param selection Array of listStudents currently selected
   */
  checkStudentsSelected(selection: any[]) {
    this.listStudents = this.listStudents.map(student => {
      return {
        ...student,
        disabled: (selection.length >= this.stations.length && !student.selected) ||
          (student.planner && student.planner !== this.plannerSelected.planner)
      };
    });
  }



  /**
   * Creates or updates the shift selected.
   * Then reloads all plannersMatrix and hides the modal.
   */
  submitFormShift($event: any, value: any) {
    if (!this.shiftForm.valid) {
      return;
    }

    const request = (
      this.isEditing.edit ?
        this.updateShift(this.isEditing.itemRef, value.shift_code, value.time_start) :
        this.createShift(value.shift_code, value.time_start)
    );

    request.then(() => {
      this.loadPlanner();
      this.closeModalShift();
    });
  }

  /**
   * Hides the shift modal and resets the form.
   */
  closeModalShift() {
    this.showAddShift = false;
    this.shiftForm.reset();
  }

  /**
   * Calls ApiService to delete the shift selected.
   * Then reloads all plannersMatrix and hides the modal.
   *
   * @param shift Reference of the selected shift
   */
  modalDeleteShift(shift: Shift) {
    this.deleteShift(shift)
      .then( () => {
        this.loadPlanner();
        this.closeModalShift();
      });
  }

  /**
   * Shows the shift modal, then fills the form inputs with the shift if passed.
   *
   * @param shift? Resource selected
   */
  addShift(shift?: any) {
    this.showAddShift = true;

    if (shift) {
      this.shiftForm.setValue({shift_code: shift.shiftCode, 'time_start': shift.timeStart});
    }

    this.isEditing = {
      itemRef: shift ? shift : null,
      edit: (typeof shift !== 'undefined')
    };
  }

  /**
   * Creates or updates the round selected.
   * Then reloads all plannersMatrix and hides the modal.
   */
  submitFormRound($event: any, value: any) {
    if (!this.roundForm.valid) {
      return;
    }

    const request = (
      this.isEditing.edit ?
        this.updateRound(this.isEditing.itemRef, value.round_code, value.description) :
        this.createRound(value.round_code, value.description)
    );

    request.then(() => {
      this.loadPlanner();
      this.closeModalRound();
    });
  }

  /**
   * Hides the round modal and resets the form.
   */
  closeModalRound() {
    this.showAddRound = false;
    this.roundForm.reset();
  }

  /**
   * Calls ApiService to delete the round selected.
   * Then reloads all plannersMatrix and hides the modal.
   *
   * @param round Reference of the selected round
   */
  modalDeleteRound(round: any) {
    this.deleteRound(round)
      .then(() => {
        this.loadPlanner();
        this.closeModalRound();
      });
  }

  /**
   * Shows the round modal, then fills the form inputs with the round if passed.
   *
   * @param round? Resource selected
   */
  addRound(round?: Round) {
    this.showAddRound = true;

    if (round) {
      this.roundForm.setValue({description: round.description, round_code: round.roundCode});
    }

    this.isEditing = {
      itemRef: round ? round : null,
      edit: (typeof round !== 'undefined')
    };
  }
}
