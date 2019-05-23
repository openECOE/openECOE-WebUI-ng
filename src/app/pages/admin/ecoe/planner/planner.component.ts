import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../../services/api/api.service';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, from} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ECOE, Station, Student} from '../../../../models/ecoe';
import {Planner, Round, Shift} from '../../../../models/planner';
import {Item, Pagination} from '@openecoe/potion-client';

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

  plannerSelected: { shift: Shift, round: Round, planner: Planner };

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
      shift_code: [null, Validators.required],
      datePicker: [null, Validators.required],
      timePicker: [null, Validators.required],
    });

    this.roundForm = this.formBuilder.group({
      round_code: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loading = true;

    this.ecoeId = +this.route.snapshot.params.id;
    ECOE.fetch(this.ecoeId)
      .then(ecoe => {
        this.ecoe = ecoe;
        this.loadRoundsShifts().then(() => this.loading = false);
      });

  }

  /**
   * Delete the planner passed.
   * Then reloads all plannersMatrix and hides the modal.
   *
   * @param planner Reference of the selected planner
   */
  deletePlanner(planner: Planner): Promise<any> {
    this.loading = true;
    return planner.destroy()
      .then(value => {
        console.log('Planner deleted', value);
        this.loadRoundsShifts().then(() => this.loading = false);
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
            .then(value => {
              console.log('Round deleted', value);
              resolve(value);
            })
            .catch(reason => reject(reason));
        });
    });
  }

  /**
   * Invokes the method save() of the shift passed
   *
   * @param shift Reference of the selected Shift
   */
  saveShift(shift: Shift | Item): Promise<any> {
    return shift.save()
      .then(value => console.log('Shift Saved', value))
      .catch(reason => console.error('Shift Saving Error', reason));
  }

  /**
   * Create the shift with the values passed
   *
   * @param shift_code Code of the shift created
   * @param time_start Date and hour of the shift
   */
  createShift(shift_code: string, time_start: Date): Promise<void> {
    return this.updateShift(new Shift(), shift_code, time_start);
  }

  /**
   * Update the shift with the values
   *
   * @param shift Reference of the selected Shift
   * @param shift_code Code of the shift created
   * @param time_start Date and hour of the shift
   */
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
            .then(value => {
              console.log('Shift deleted', value);
              resolve(value);
            })
            .catch(reason => reject(reason));
        });
    });


  }

  /**
   * Load shifts and rounds by the passed ECOE.
   * Then calls [buildPlanner]{@link #buildPlanner} function.
   */
  loadRoundsShifts(): Promise<any> {
    return new Promise(resolve => {
      this.rounds = [];
      this.shifts = [];

      const excludeItems = ['ecoe', 'organization'];

      forkJoin(
        from(Round.query({
            where: {'ecoe': this.ecoeId},
            sort: {'round_code': false}
          }, {cache: false, skip: excludeItems})
        ),
        from(Shift.query({
            where: {'ecoe': this.ecoeId},
            sort: {'time_start': false}
          }, {cache: false, skip: excludeItems})
        )
      ).subscribe(response => {
        this.rounds = response[0];
        this.shifts = response[1];
        resolve(response);
      });
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
    const time = value.timePicker;
    const timeStart = value.datePicker;

    timeStart.setHours(time.getHours());
    timeStart.setMinutes(time.getMinutes());
    timeStart.setSeconds(0);

    const request = (
      this.isEditing.edit ?
        this.updateShift(this.isEditing.itemRef, value.shift_code, timeStart) :
        this.createShift(value.shift_code, timeStart)
    );

    request.then(() => {
      this.loadRoundsShifts();
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
      .then(() => {
        this.loadRoundsShifts();
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
      this.shiftForm.setValue({shift_code: shift.shiftCode, datePicker: shift.timeStart, timePicker: shift.timeStart});
    } else {
      if (this.shifts.length > 0) {
        const lastShift = this.shifts[this.shifts.length - 1];

        this.ecoe.configuration()
          .then(conf => {
            const stagesDuration = conf.schedules.reduce((sum, current) => sum + current.duration, 0);
            const totalShift = stagesDuration * conf.reruns;

            const timeDefault = new Date(lastShift.timeStart.getTime() + totalShift * 1000);

            // TODO: Calculate next shift with stages time
            this.shiftForm.setValue({shift_code: '', datePicker: timeDefault, timePicker: timeDefault});
          });
      }
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
      this.loadRoundsShifts();
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
        this.loadRoundsShifts();
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

  getStudents(page: number = 1, perPage: number = 100) {
    const excludeItems = ['ecoe', 'planner'];


    return Student.query<Student, Pagination<Student>>({
        where: {ecoe: this.ecoeId},
        sort: {surnames: false, name: false},
        perPage: perPage,
        page: page
      },
      {paginate: true, skip: excludeItems}
    );
  }


  autoCreatePlanners() {
    this.loading = true;

    forkJoin(
      from(this.createAllPlanners()),
      from(Station.query<Station>({where: {ecoe: this.ecoeId}})),
      from(this.getStudents())
    ).subscribe(async response => {
      const promises = [];

      const listPlanners: Array<any> = response[0];
      const listStations: Array<any> = response[1];
      const pageStudents: Pagination<Student> = response[2];


      for (let i = 1; i < pageStudents.pages; i += 1) {
        pageStudents['items'].forEach(student => {
          const freePlanner = listPlanners.find(value => value.students.length < listStations.length);

          if (freePlanner) {
            promises.push(this.assignStudentToPlanner(student, freePlanner));
          }
        });

        // Load next Students page
        await pageStudents.changePageTo(i++);
      }


      Promise.all(promises)
        .then(value => this.loadRoundsShifts())
        .finally(() => this.loading = false);
    });
  }

  assignStudentToPlanner(itemStudent: Student, itemPlanner: Planner): Promise<any> {
    itemStudent.planner = itemPlanner;
    itemStudent.plannerOrder = itemPlanner.students.length + 1;
    itemPlanner.students.push(itemStudent);
    return itemStudent.save();
  }

  findPlanner(shift: Shift, round: Round): Promise<any> {
    return new Promise((resolve) => {
      Planner.first({where: {'round': round, 'shift': shift}})
        .then(value => {
          if (value) {
            resolve(value);
          } else {
            const newPlanner = new Planner();
            newPlanner.shift = shift;
            newPlanner.round = round;
            newPlanner.save()
              .then(savedPlanner => {
                shift.planners.push(newPlanner);
                round.planners.push(newPlanner);
                resolve(savedPlanner);
              });
          }
        });
    });
  }

  createAllPlanners(): Promise<any> {
    const promises = [];


    this.rounds.forEach(async (round, round_index) => {
      this.shifts.forEach(async (shift, shift_index) => {

        // Create all planners, if created catch error and ignore
        promises.push(this.findPlanner(shift, round));
      });
    });

    return Promise.all(promises);
  }

}
