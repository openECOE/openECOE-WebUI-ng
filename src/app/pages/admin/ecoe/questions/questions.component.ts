import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {ApiService} from '../../../../services/api/api.service';
import {forkJoin} from 'rxjs';
import {Area, ECOE, QBlock, Station} from '../../../../models';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';

/**
 * Component with questions and options by question.
 */
@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.less']
})

export class QuestionsComponent implements OnInit {

  ecoe: ECOE;
  stations: Station[] = [];
  stationSelected: Station;
  qblocks: QBlock[] = [];
  editCacheOption = {};
  editCache = {};
  ecoeId: number;
  qblockId: number;
  stationId: number;
  questionShowQblocks = {};

  index: number = 1;

  isVisible: boolean = false;

  rowQblock: RowQblock = {
    name: ['', Validators.required]
  };

  data: object = {
    qblockRow: [this.rowQblock]
  };

  qblockForm: FormGroup;
  control: FormArray;

  logPromisesERROR: { value: any, reason: any }[] = [];
  logPromisesOK: any[] = [];

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder) {

    this.qblockForm = this.fb.group({
      qblockRow: this.fb.array([])
    });

    this.control = <FormArray>this.qblockForm.controls.qblockRow;
  }

  /**
   * Listens for URL changes to filter the questions by station and Qblock.
   */
  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;

    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.qblockId = params.get('qblock') ? +params.get('qblock') : null;
      this.stationId = params.get('station') ? +params.get('station') : null;
      this.loadQuestions();
    });

    this.InitQblockRow();
  }

  /**
   * Load questions by the passed Station and ECOE.
   * Loads all the stations, then filters by the station passed on the URL and loads their qblocks.
   * Finally, loads the questions for each Qblock and creates the multi-level array.
   */
  async loadQuestions() {
    // TODO: Only fetch 10 questions per station, need to create pagination for questions
    this.ecoe = await ECOE.fetch<ECOE>(this.ecoeId);

    const pagStations = await this.ecoe.stations({sort: {order: false}}, {paginate: true, cache: false});
    this.stations = [...pagStations['items']];

    for (let i = 2; i <= pagStations.pages; i++) {
      await pagStations.changePageTo(i);
      this.stations = [...this.stations, ...pagStations['items']];
    }

    this.stationSelected = await Station.fetch<Station>(this.stationId ? this.stationId : this.stations[0].id);
    this.stationId = this.stationSelected.id;

    const pagQblocks = await this.stationSelected.qblocks({}, {paginate: true, cache: false});
    this.qblocks = [...pagQblocks['items']];

    for (let i = 2; i <= pagQblocks.pages; i++) {
      this.qblocks = [...this.qblocks, ...(await pagQblocks.changePageTo(i)).items];
    }

    this.updateEditCache();
  }

  /**
   * Adds to the resource passed its array of options as a new key object.
   * Then updates the options cache.
   *
   * @param expand State of the expanded sub-table
   * @param question Resource selected to show its options
   */
  loadOptionsByQuestion(expand: boolean, question: any) {
    if (expand) {
      this.apiService.getResources('option', {
        where: `{"question":${question.id}}`,
        sort: '{"order":false}'
      }).subscribe(options => {
        question.optionsArray = options;

        question.optionsArray.forEach(option => {
          this.editCacheOption[option.id] = {
            edit: this.editCacheOption[option.id] ? this.editCacheOption[option.id].edit : false,
            ...option
          };
        });
      });
    }
  }

  /**
   * Load qblocks by the passed station.
   *
   * @param stationId Id of the parent resource
   */
  loadQblocksByStation(stationId: number) {
    this.apiService.getResources('qblock', {
      where: `{"station":${stationId}}`
    }).subscribe(qblocks => this.qblocks = qblocks);
  }

  /**
   * Updates editCache variable with the same values of the resources array and adds a 'edit' key.
   */
  updateEditCache(): void {
    this.editCache = {};
    this.qblocks.forEach(async qb => {
      qb.questions.forEach(item => {
        this.questionShowQblocks[item.id] = {
          show: false
        };
        this.editCache[item.id] = {
          edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
          data: Object.assign({}, item)
        };
      });
    });
  }

  /**
   * Moves the passed question to the selected Qblock.
   * Then reloads the questions array.
   *
   * @param questionId Id of the resource passed
   * @param qblockPrevId Id of the actual Qblock
   * @param qblockNextId Id of the Qblock to move in
   */
  moveQuestion(questionId: number, qblockPrevId: number, qblockNextId: number) {
    forkJoin(
      this.apiService.deleteResource(`/api/qblock/${qblockPrevId}/questions`, questionId),
      this.apiService.createResource(`qblock/${qblockNextId}/questions`, questionId)
    ).subscribe(() => {
      this.questionShowQblocks[questionId].show = false;
      this.loadQuestions();
    });
  }

  /**
   * Removes the Qblock filter and reloads the page by updating the URL.
   *
   * @param station Id of the station passed
   */
  deleteFilter(station: number) {
    this.router.navigate(['../questions'], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {station: station}
    });
  }

  /**
   * Saves array of data in data base. The data can be provided from external file or from
   * multiple rows form.
   * @param items obtained from form array or array form.
   */
  saveArrayQblocks(items: any[]): Promise<any> {
    const savePromises = [];
    this.logPromisesERROR = [];
    this.logPromisesOK = [];

    items.forEach((item, idx) => {
      if (item.name) {
        item['station'] = this.stationSelected;
        item['order'] = this.qblocks.length + idx;

        const qblock = new QBlock(item);

        const promise = qblock.save()
          .then(result => {
            this.logPromisesOK.push(result);
            return result;
          })
          .catch(err => {
            this.logPromisesERROR.push({
              value: item,
              reason: err
            });
            return err;
          });
        savePromises.push(promise);
      }
    });

    return Promise.all(savePromises)
      .then(() =>
        new Promise((resolve, reject) =>
          this.logPromisesERROR.length > 0 ? reject(this.logPromisesERROR) : resolve(items)))
      .catch(err => new Promise(((resolve, reject) => reject(err))));
  }

  /**
   * Opens form window to add new qblock/s
   */
  showDrawer() {
    this.isVisible = true;
  }

  /**
   * Closes the form qblock window
   */
  closeDrawer() {
    this.isVisible = false;
  }

  /**
   * Adds new row (name field) qblock to the form
   */
  addQblockRow() {
    this.control.push(this.fb.group(this.rowQblock));
  }

  /**
   * Deletes selected row qblock whose was added previously
   * @param index id field to find and remove.
   */
  deleteRow(index) {
    this.control.removeAt(index);
  }

  /**
   *At first time when OnInit, adds new qblock row;
   * in other cases resets the number of rows to 1 when the
   * form window was closed.
   */
  InitQblockRow() {
    if (this.control.length === 0) {
      this.addQblockRow();
    } else {
      while (this.control.length > 1) {
        this.control.removeAt(1);
      }
      this.control.reset();
    }
  }

  /**
   * Obtains de formControl instance of any element in our form.
   * @param name of the field, in our case can be 'name' or 'code'
   * @param idx the index of the field.
   */
  getFormControl(name: string, idx: number): AbstractControl {
    return this.qblockForm.get('qblockRow')['controls'][idx].controls[name];
  }

  /**
   * Before save values in data base, in first time checks that
   * all fields are validates and then will save the values.
   */
  submitForm(): void {
    for (const i in this.qblockForm.get('qblockRow')['controls']) {
      if (this.qblockForm.get('qblockRow')['controls'].hasOwnProperty(i)) {
        this.getFormControl('name', +i).markAsDirty();
        this.getFormControl('name', +i).updateValueAndValidity();
      }
    }
    if (this.qblockForm.valid) {
      this.saveArrayQblocks(this.qblockForm.get('qblockRow').value)
        .finally(() => {
          this.loadQuestions();
          this.closeDrawer();
          this.InitQblockRow();
        });
    }
  }

  /**
   * When user decides do not save the form values and
   * close the form window: will close the drawer window
   * and reset the number of row qblocks.
   */
  cancelForm() {
    this.closeDrawer();
    this.InitQblockRow();
  }

}

export interface RowQblock {
  name: any[];
}
