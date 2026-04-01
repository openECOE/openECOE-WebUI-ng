import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api/api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {forkJoin, from} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ECOE, Station, Student} from '../../../models';
import {Planner, Round, Shift} from '../../../models';
import {Item, Pagination} from '@openecoe/potion-client';
import {ActionMessagesService} from '@app/services/action-messages/action-messages.service';
import {TranslateService} from '@ngx-translate/core';
import { PlannerService } from '@app/services/planner/planner.service';
import { Papa } from 'ngx-papaparse';

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
  ecoe_name: String;

  shifts: Shift[] = [];
  rounds: Round[] = [];
  stations: any[] = [];
  stationsTotal: number;

  showAddShift: boolean = false;
  showAddRound: boolean = false;

  isEditing: { itemRef: any, edit: boolean };

  shiftForm: FormGroup;
  roundForm: FormGroup;

  loading: boolean = false;

  logPromisesERROR: any[] = [];
  totalStudents: number;

  // Import planner from Excel
  showImportModal: boolean = false;
  importFileName: string = 'OrdenEstacion_Plantilla.xlsx';
  importFields: string[] = ['IGO-POGPSIQ', 'ESTUDIANTE', 'APELLIDOS', 'NOMBRE', 'Estación Inicial'];

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private router: Router,
              private message: ActionMessagesService,
              private translate: TranslateService,
              private plannerService: PlannerService,
              private papaParser: Papa) {

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
    this.plannerService.registerCheckStudentCapacity(this.checkStudentCapacity.bind(this));

    this.route.params.subscribe(params => {
      this.loading = true;
      const excludeItems = [];
      this.ecoeId = +params.ecoeId;
      ECOE.fetch(this.ecoeId, { skip: excludeItems })
        .then(value => {
          this.ecoe = value;
          this.ecoe_name = this.ecoe.name;
          this.loadStations();
          this.loadRoundsShifts().then(() => {
            this.loading = false;
            this.checkStudentCapacity().then(() => {
              this.warningMessage();
              this.loading = false;
            });
          });
        });
    });
  }

  loadStations() {
    const excludeItems = [];

    Station.query({where: {ecoe: this.ecoeId}}, {skip: excludeItems, paginate: true})
      .then(value => {
        this.stations = value['items'];
        this.stationsTotal = value['total'];
      });
  }

  checkStudentCapacity(): Promise<void> {
    return this.getStudents().then(pageStudents => {
      this.totalStudents = pageStudents.total;
    });
  }

  warningMessage() {
    if (this.totalStudents !== 0) {
      this.message.createWarningMsg(this.translate.instant("AUTO_ASSINGMENT_EXCESS_STUDENTS", {totalStudents : this.totalStudents}));
    }else{
      this.message.createSuccessMsg(this.translate.instant("AUTO_ASSINGMENT_SUCCESS"));
    }
  }
  
  /**
   * Delete the planner passed.
   * Then reloads all plannersMatrix and hides the modal.
   *
   * @param planner Reference of the selected planner
   */
  deletePlanner(planner: Planner): Promise<any> {
    return planner.destroy();
  }

  saveRound(round: Round | Item): Promise<any> {
    this.logPromisesERROR = [];
    return round.save()
      .then(value => console.log('Round Saved', value))
      .catch(err => {
        this.logPromisesERROR.push({
          value: round,
          reason: err
        });
        return err;
      });
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
    let planners: Planner[];

    return new Promise((resolve, reject) => {
      const promises = [];

      Planner.query({where: {round: +round.id}})
        .then((result: Planner[]) => {
          planners = result;

          // Delete all planners linked
          planners.forEach(planner => {
            promises.push(this.deletePlanner(planner));
          });

          Promise.all(promises)
            .then(() => {
              this.checkStudentCapacity();
              round.destroy()
                .then(() => resolve())
                .catch(reason => reject(reason));
            });
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
      .catch(err => {
        this.logPromisesERROR.push({
          value: shift,
          reason: err
        });
        return err;
      });
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
    shift.shiftCode = shift_code;
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
      let planners: Planner[];
      const promises = [];

      Planner.query({where: {shift: +shift.id}})
        .then((result: Planner[]) => {
          planners = result;

          // Delete all planners linked
          planners.forEach(planner => {
            promises.push(this.deletePlanner(planner));
          });

          console.log(shift, this.shifts);

          Promise.all(promises)
            .then(() => {
              this.checkStudentCapacity();
              shift.destroy()
                .then(value => resolve(value))
                .catch(reason => reject(reason));
            });
        });
    });
  }

  /**
   * Load shifts and rounds by the passed ECOE.
   * Then calls [buildPlanner] function.
   */
  loadRoundsShifts(): Promise<any> {
    return new Promise(resolve => {
      this.rounds = [];
      this.shifts = [];

      const excludeItems = [];

      forkJoin(
        from(Round.query<Round>({
            where: {'ecoe': this.ecoeId},
            sort: {'round_code': false}
          }, {cache: false, skip: excludeItems})
        ),
        from(Shift.query<Shift>({
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
    this.loading = true;
    this.deleteRound(round)
      .then(() => {
        this.loadRoundsShifts().finally(() =>
          this.closeModalRound());
      })
      .finally(() => this.loading = false);
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

  getStudents(page: number = 1, perPage: number = 100): Promise<Pagination<Student>> {
    const excludeItems = [];

    return Student.query<Student, Pagination<Student>>({
        where: {ecoe: this.ecoeId, planner: null},
        sort: {surnames: false, name: false},
        perPage: perPage,
        page: page
      },
      {paginate: true, skip: excludeItems}
    );
  }

  async autoCreatePlanners() {
    this.loading = true;
  
    const [listPlanners, listStations, pageStudents] = await forkJoin(
      from(this.createAllPlanners()),
      from(Station.query<Station>({ where: { ecoe: this.ecoeId } })),
      from(this.getStudents())
    ).toPromise();
  
    const promises = [];
  
    for (let i = 1; i <= pageStudents.pages; i += 1) {
      // Load next Students page
      const page = await pageStudents.changePageTo(i);
      page['items'].forEach(student => {
        const freePlanner = listPlanners.find(value => (value.students ? value.students.length : 0) < listStations.length);
        if (freePlanner) {
          promises.push(this.assignStudentToPlanner(student, freePlanner));
        }
      });
    }
  
    Promise.all(promises).then(() => {
      this.loadRoundsShifts().then(() => {
        this.checkStudentCapacity().then(() => {
          this.warningMessage();
          this.loading = false;
        });
      });
    });
  
    this.loading = false;
  }

  assignStudentToPlanner(itemStudent: Student, itemPlanner: Planner): Promise<any> {
    itemPlanner.students = itemPlanner.students || [];
    itemStudent.planner = itemPlanner;
    itemStudent.plannerOrder = (itemPlanner.students.length || 0) + 1;
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
                if (!shift.planners) { shift.planners = []; }
                if (!round.planners) { round.planners = []; }
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


    this.rounds.forEach((round) => {
      this.shifts.forEach((shift) => {

        // Create all planners, if created catch error and ignore
        promises.push(this.findPlanner(shift, round));
      });
    });

    return Promise.all(promises);
  }

  onBack() {
    this.router.navigate(['/ecoe/' + this.ecoeId + '/admin']).finally();
  }

  /**
   * Resets the array of promise errors when tried to save on
   * data base.
   */
   clearImportErrors() {
    this.logPromisesERROR = [];
  }

  // ========== IMPORT PLANNER FROM EXCEL ==========

  /**
   * Opens the import planner modal
   */
  openImportModal() {
    this.showImportModal = true;
  }

  /**
   * Closes the import planner modal
   */
  closeImportModal() {
    this.showImportModal = false;
  }

  /**
   * Generates and downloads a CSV template file for planner import.
   * The template includes columns: IGO-POGPSIQ, ESTUDIANTE, APELLIDOS, NOMBRE, Estación Inicial
   * Shifts are separated by a marker row: ---TURNO---
   */
  async downloadPlannerTemplate() {
    // Get all students for this ECOE to populate sample data
    const allStudents: Student[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const pageResult = await Student.query<Student, Pagination<Student>>({
        where: { ecoe: this.ecoeId },
        sort: { surnames: false, name: false },
        perPage: 100,
        page: page
      }, { paginate: true });

      allStudents.push(...pageResult.toArray());
      hasMore = page < pageResult.pages;
      page++;
    }

    // Generate sample data rows with shift markers after each round
    // Each round has stationsTotal students, marker goes after each round
    const studentsPerRound = this.stationsTotal || 12; // Default to 12 if not set
    const sampleData: any[] = [];
    
    allStudents.forEach((student, index) => {
      // Calculate initial station: cycles through 1 to stationsTotal
      const initialStation = (index % studentsPerRound) + 1;
      sampleData.push({
        'IGO-POGPSIQ': student.dni || '',
        'ESTUDIANTE': index + 1,
        'APELLIDOS': student.surnames || '',
        'NOMBRE': student.name || '',
        'Estación Inicial': initialStation
      });
      
      // Add shift marker after each complete round (when we've filled all stations)
      // Marker goes after student at position that completes a round (index+1 is divisible by studentsPerRound)
      if ((index + 1) % studentsPerRound === 0 && index < allStudents.length - 1) {
        sampleData.push({
          'IGO-POGPSIQ': '---TURNO---',
          'ESTUDIANTE': '',
          'APELLIDOS': '',
          'NOMBRE': '',
          'Estación Inicial': ''
        });
      }
    });

    // If no students, add example rows with shift marker
    if (sampleData.length === 0) {
      const exampleStations = studentsPerRound || 3;
      // Example round 1
      for (let i = 1; i <= exampleStations; i++) {
        sampleData.push({
          'IGO-POGPSIQ': `1234567${i}A`,
          'ESTUDIANTE': i,
          'APELLIDOS': `Apellido${i}`,
          'NOMBRE': `Nombre${i}`,
          'Estación Inicial': i
        });
      }
      // Shift marker after round 1
      sampleData.push({
        'IGO-POGPSIQ': '---TURNO---',
        'ESTUDIANTE': '',
        'APELLIDOS': '',
        'NOMBRE': '',
        'Estación Inicial': ''
      });
      // Example round 2
      for (let i = 1; i <= exampleStations; i++) {
        sampleData.push({
          'IGO-POGPSIQ': `2345678${i}B`,
          'ESTUDIANTE': exampleStations + i,
          'APELLIDOS': `Apellido${exampleStations + i}`,
          'NOMBRE': `Nombre${exampleStations + i}`,
          'Estación Inicial': i
        });
      }
    }

    const csv = this.papaParser.unparse({
      fields: this.importFields,
      data: sampleData.map(row => [
        row['IGO-POGPSIQ'],
        row['ESTUDIANTE'],
        row['APELLIDOS'],
        row['NOMBRE'],
        row['Estación Inicial']
      ])
    }, {
      delimiter: ';',
      quotes: true,
      quoteChar: '"',
      escapeChar: '"',
      header: true
    });

    // Download file
    const BOMprefix = '\uFEFF';
    const blob = new Blob([BOMprefix + csv], { type: 'text/csv;charset=' + document.characterSet });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = this.ecoe_name + '_' + this.importFileName.replace('.xlsx', '.csv');
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  /**
   * Handle the uploaded file for planner import
   */
  handlePlannerUpload = (file: any) => {
    const fr = new FileReader();
    fr.onload = (e) => {
      file.onSuccess({}, file.file, 'success');
      const fileContent = fr.result.toString();
      this.processPlannerImport(fileContent);
    };
    fr.readAsText(file.file);
    this.closeImportModal();
  }

  /**
   * Process the imported CSV file and assign students to planners.
   * Students are ordered by shift and round in the file.
   * Shifts are separated by marker rows with "---TURNO---" in the DNI column.
   * Within each shift, students are grouped into rounds (X students per round = number of stations).
   * Shifts and rounds are created automatically if they don't exist.
   */
  async processPlannerImport(fileString: string) {
    this.loading = true;
    this.logPromisesERROR = [];

    // Shift marker constant
    const SHIFT_MARKER = '---TURNO---';

    // Preprocess: Normalize line endings and fix common CSV issues
    // Replace Windows CRLF and old Mac CR with Unix LF
    let normalizedCsv = fileString
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');
    
  
    // Split by newlines and process line by line to handle this properly
    const lines = normalizedCsv.split('\n').filter(line => line.trim() !== '');
    
    // Detect delimiter (semicolon or comma) from header
    const firstLine = lines[0] || '';
    const delimiter = firstLine.includes(';') ? ';' : ',';
    
    console.log('Total lines after split:', lines.length, 'Delimiter:', delimiter);
    console.log('Lines:', lines);
    
    // Rebuild the CSV ensuring each line is properly separated
    const cleanCsv = lines.join('\n');

    // Parse CSV
    this.papaParser.parse(cleanCsv, {
      header: true,
      delimiter: delimiter,
      dynamicTyping: false, // Keep as strings to avoid issues with DNI parsing
      skipEmptyLines: true,
      quoteChar: '"',
      escapeChar: '"',
      transform: (value) => {
        const trimmedValue = value?.trim() || '';
        return trimmedValue === '' ? null : trimmedValue;
      },
      complete: async (results) => {
        const importedRows = results.data as any[];
        
        console.log('Parsed rows:', importedRows.length, 'Delimiter:', delimiter);
        
        if (importedRows.length === 0) {
          this.message.createWarningMsg(this.translate.instant('NO_DATA_TO_IMPORT'));
          this.loading = false;
          return;
        }

        // Separate rows into shifts based on markers
        // Each ---TURNO--- marker indicates the END of a shift group
        const shiftGroups: any[][] = [];
        let currentShiftStudents: any[] = [];

        for (const row of importedRows) {
          // Get DNI value - could be in different column name variations
          let dniValue = row['IGO-POGPSIQ'];
          if (dniValue === undefined || dniValue === null) {
            // Try other possible column names
            dniValue = row['DNI'] || row['dni'] || Object.values(row)[0];
          }
          dniValue = dniValue?.toString().trim() || '';
          
          console.log('Processing row, DNI:', dniValue, 'Row:', JSON.stringify(row));
          
          if (dniValue === SHIFT_MARKER) {
            // Marker found - end current shift and start a new one
            // IMPORTANT: Push current group even if it has students, then reset
            if (currentShiftStudents.length > 0) {
              console.log('Shift marker found, saving group with', currentShiftStudents.length, 'students');
              shiftGroups.push([...currentShiftStudents]); // Use spread to create a copy
            }
            currentShiftStudents = []; // Reset for next shift
          } else if (dniValue && dniValue !== '') {
            // Regular student row - add to current shift
            currentShiftStudents.push(row);
          }
        }
        
        // Don't forget the last shift group (students after last marker or if no markers)
        if (currentShiftStudents.length > 0) {
          console.log('Adding final group with', currentShiftStudents.length, 'students');
          shiftGroups.push([...currentShiftStudents]);
        }
        
        console.log('Total shift groups:', shiftGroups.length, 'Sizes:', shiftGroups.map(g => g.length));

        if (shiftGroups.length === 0) {
          this.message.createWarningMsg(this.translate.instant('NO_DATA_TO_IMPORT'));
          this.loading = false;
          return;
        }

        // Get all students for this ECOE indexed by DNI
        const studentsMap = new Map<string, Student>();
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const pageResult = await Student.query<Student, Pagination<Student>>({
            where: { ecoe: this.ecoeId },
            perPage: 100,
            page: page
          }, { paginate: true });

          pageResult.toArray().forEach(student => {
            if (student.dni) {
              studentsMap.set(student.dni.toString().trim(), student);
            }
          });
          hasMore = page < pageResult.pages;
          page++;
        }

        // Number of stations determines max capacity per round
        const groupSize = this.stationsTotal;

        if (groupSize === 0) {
          this.message.createErrorMsg(this.translate.instant('NO_STATIONS_CONFIGURED'));
          this.loading = false;
          return;
        }

        // Calculate how many shifts we need based on shift groups
        // Each shift group in the CSV = one shift, each goes to Round 1
        const shiftsNeeded = shiftGroups.length;
        
        // We only need 1 round since each shift group maps to (Shift N, Round 1)
        const maxRoundsNeeded = 1;
        
        console.log('Shifts needed:', shiftsNeeded, 'Rounds needed:', maxRoundsNeeded);
        console.log('Shift group sizes:', shiftGroups.map(g => g.length));

        // Create shifts if needed
        if (this.shifts.length < shiftsNeeded) {
          const shiftsToCreate = shiftsNeeded - this.shifts.length;
          //first shift hour at 8AM, stagger by 2h until 12PM, stagger to 4PM, stagger shifts by 2h until final turn at 6PM
            // Define the allowed shift start hours: 8, 10, 12, 16, 18
            const shiftHours = [8, 10, 12, 16, 18];
            let baseDate = new Date();
            baseDate.setHours(0, 0, 0, 0); // Start at midnight today
            for (let s = 0; s < shiftsToCreate; s++) {
              const shiftIndex = this.shifts.length + s;
              // Cycle through shiftHours if more shifts are needed than defined hours
              const hourIdx = shiftIndex % shiftHours.length;
              if (shiftIndex > 0 && hourIdx === 0) {
                // Move to next day after last hour
                baseDate.setDate(baseDate.getDate() + 1);
              }
              const timeStart = new Date(baseDate);
              timeStart.setHours(shiftHours[hourIdx], 0, 0, 0);
              const shiftCode = `T${shiftIndex + 1}`;
              await this.createShift(shiftCode, timeStart);
            }
          // Reload shifts
          await this.loadRoundsShifts();
        }

        // Create rounds if needed
        if (this.rounds.length < maxRoundsNeeded) {
          const roundsToCreate = maxRoundsNeeded - this.rounds.length;
          for (let r = 0; r < roundsToCreate; r++) {
            const roundCode = `R${this.rounds.length + r + 1}`;
            const description = `Ronda ${this.rounds.length + r + 1}`;
            await this.createRound(roundCode, description);
          }
          // Reload rounds
          await this.loadRoundsShifts();
        }

        // Create all planners for shift/round combinations
        await this.createAllPlanners();
        
        // Now process students by shift groups
        // Each shift group is independent - students don't overflow to next shift
        const savePromises = [];
        const plannersCache = new Map<string, Planner>();

        for (let shiftIndex = 0; shiftIndex < shiftGroups.length; shiftIndex++) {
          const shiftStudents = shiftGroups[shiftIndex];
          const shift = this.shifts[shiftIndex];

          if (!shift) {
            // Log error for all students in this shift group
            for (const row of shiftStudents) {
              this.logPromisesERROR.push({
                value: JSON.stringify(row),
                reason: { statusText: 'Invalid shift', message: this.translate.instant('SHIFT_ROUND_NOT_AVAILABLE') }
              });
            }
            continue;
          }

          // Process each student within this shift
          // ALL students in one shift group go to Round 1 (index 0) for that shift
          // The shift marker separates shifts, within each shift there's only one round assignment
          for (let studentIndexInShift = 0; studentIndexInShift < shiftStudents.length; studentIndexInShift++) {
            const row = shiftStudents[studentIndexInShift];
            let studentDni = row['IGO-POGPSIQ'];
            if (studentDni === undefined || studentDni === null) {
              studentDni = row['DNI'] || row['dni'] || Object.values(row)[0];
            }
            studentDni = studentDni?.toString().trim() || '';
            const initialStation = parseInt(row['Estación Inicial']) || (studentIndexInShift + 1);

            if (!studentDni) {
              this.logPromisesERROR.push({
                value: JSON.stringify(row),
                reason: { statusText: 'Missing DNI', message: this.translate.instant('STUDENT_DNI_REQUIRED') }
              });
              continue;
            }

            const student = studentsMap.get(studentDni);
            if (!student) {
              this.logPromisesERROR.push({
                value: JSON.stringify(row),
                reason: { statusText: 'Student not found', message: this.translate.instant('STUDENT_NOT_FOUND_DNI', { dni: studentDni }) }
              });
              continue;
            }

            // All students in this shift group go to Round 1 (index 0)
            // Each ---TURNO--- marker creates a new SHIFT, not a new round
            const roundIndex = 0;
            const round = this.rounds[roundIndex];

            if (!round) {
              this.logPromisesERROR.push({
                value: JSON.stringify(row),
                reason: { statusText: 'Invalid round', message: this.translate.instant('SHIFT_ROUND_NOT_AVAILABLE') }
              });
              continue;
            }

            // Find or get cached planner for this shift/round combination
            const cacheKey = `${shift.id}-${round.id}`;
            let planner = plannersCache.get(cacheKey);
            
            if (!planner) {
              planner = await Planner.first<Planner>({ where: { shift: shift.id, round: round.id } });
              if (planner) {
                plannersCache.set(cacheKey, planner);
              }
            }

            if (!planner) {
              // Create the planner on demand
              planner = await this.findPlanner(shift, round) as Planner;
              if (planner) {
                plannersCache.set(cacheKey, planner);
              }
            }

            if (!planner) {
              this.logPromisesERROR.push({
                value: JSON.stringify(row),
                reason: { statusText: 'Planner not found', message: this.translate.instant('PLANNER_NOT_FOUND') }
              });
              continue;
            }

            // Assign student to planner with their initial station as planner_order
            student.planner = planner;
            student.plannerOrder = initialStation;

            savePromises.push(
              student.save()
                .catch(err => {
                  this.logPromisesERROR.push({
                    value: JSON.stringify(row),
                    reason: err
                  });
                  return err;
                })
            );
          }
        }

        await Promise.all(savePromises);

        // Reload data
        await this.loadRoundsShifts();
        await this.checkStudentCapacity();

        if (this.logPromisesERROR.length > 0) {
          this.message.createWarningMsg(
            this.translate.instant('IMPORT_COMPLETED_WITH_ERRORS', { errors: this.logPromisesERROR.length })
          );
        } else {
          this.message.createSuccessMsg(this.translate.instant('PLANNER_IMPORT_SUCCESS'));
        }

        this.loading = false;
      }
    });
  }
}

