import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {ApiService} from '../../../../services/api/api.service';
import {forkJoin, from, Observable} from 'rxjs';
import {SharedService} from '../../../../services/shared/shared.service';
import {Area, ECOE, QBlock, Question, Station, Option} from '../../../../models';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Pagination} from '@openecoe/potion-client';

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
  editCache = {};
  ecoeId: number;
  qblockId: number;
  stationId: number;
  questionShowQblocks = {};

  index: number = 1;

  isVisible: boolean = false;

  loading: boolean = false;

  rowQblock: RowQblock = {
    name: ['', Validators.required]
  };

  data: object = {
    qblockRow: [this.rowQblock]
  };

  qblockForm: FormGroup;
  control: FormArray;

  question_type_options: Array<{ type: string, label: string }> = [
    {type: 'RB', label: 'ONE_ANSWER'},
    {type: 'CH', label: 'MULTI_ANSWER'},
    {type: 'RS', label: 'VALUE_RANGE'}
  ];

  readonly HEADER: { order: string, description: string, reference: string, points: string, ac: string, type: string } = {
    order: 'orden',
    description: 'enunciado',
    reference: 'referencia',
    points: 'points',
    ac: 'ac',
    type: 'type'
  };

  readonly DEFAULT_LABEL = 'Sí';
  readonly OPTIONS = 'options'; // PROPERTY NAME ADDED TO QUESTIONS ARRAY.
  readonly OPTION = 'option';
  readonly POINTS = 'points';

  logPromisesERROR: any[] = [];
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
    this.loading = true;
    // TODO: Only fetch 10 questions per station, need to create pagination for questions
    this.ecoe = await ECOE.fetch<ECOE>(this.ecoeId);

    const pagStations = await Station.query<Station, Pagination<Station>>({
      where: {ecoe: this.ecoe},
      sort: {order: false}
    }, {
      paginate: true,
      cache: false
    });
    this.stations = [...pagStations['items']];

    for (let i = 2; i <= pagStations.pages; i++) {
      await pagStations.changePageTo(i);
      this.stations = [...this.stations, ...pagStations['items']];
    }

    this.stationSelected = await Station.fetch<Station>(this.stationId ? this.stationId : this.stations[0].id);
    this.stationId = this.stationSelected.id;

    const pagQblocks = await QBlock.query<QBlock, Pagination<QBlock>>({
      where: {station: this.stationSelected},
      sort: {order: false}
    }, {
      paginate: true, cache: false
    });

    this.qblocks = [...pagQblocks['items']];

    for (let i = 2; i <= pagQblocks.pages; i++) {
      this.qblocks = [...this.qblocks, ...(await pagQblocks.changePageTo(i)).items];
    }

    this.updateEditCache();

    this.loading = false;
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
    console.log('deleteFilter:', station);
    this.router.navigate(['../questions'], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {station: station}
    }).finally();
  }

  /**
   * convert a simple array of objects to specific structure (grouped by block names and questions)
   * currently blockname is true when the object has description but doesnt has the order number.
   * in other case, for identify an question, that must have next properties: order, description and points.
   * @param items array of items to parse
   */
  mapFile(items: any[]) {
    const newArr: any[] = [];
    const currentBlock: { name: string; questions: any[] } = {name: '', questions: []};
    let aux: any = {};

    items.forEach((item, idx) => {
      if (!item[this.HEADER.order] && item[this.HEADER.description]) {
        if (idx === 0) {
          currentBlock.name = item[this.HEADER.description];
          currentBlock.questions = [];
        } else {
          aux = {};
          Object.assign(aux, currentBlock);
          newArr.push(aux);
          currentBlock.name = item[this.HEADER.description];
          currentBlock.questions = [];
        }
      } else if (item[this.HEADER.order] && item[this.HEADER.description] && item[this.HEADER.points]) {
        item[this.OPTIONS] = this.getOptions(item);
        currentBlock.questions.push(item);
      }
    });

    aux = {};
    Object.assign(aux, currentBlock);
    newArr.push(aux);

    return newArr;
  }

  /**
   * Obtains for every question, all options available (radio buttons, range selects and checkboxs)
   * @param item is a question row
   */
  getOptions(item: object) {
    Object.keys(item).forEach((key) => (item[key] == null) && delete item[key]);

    const propertyNames = Object.getOwnPropertyNames(item);

    const options = propertyNames.filter(value => value.toLowerCase().match(/option\d+$/));
    const points = propertyNames.filter(value => value.toLowerCase().match(/points\d+$/));

    const optionArray: any[] = [];

    points.forEach((point, index) => {
      const row: {} = {};
      row[options[index]] = item[options[index]];
      row[point] = item[point];
      optionArray.push(row);
    });

    options.forEach((key) => delete item[key]);
    points.forEach((key) => delete item[key]);

    return optionArray;
  }

  /**
   * Simple method that calls #mapFile for map initial array to specific structure
   * and later calls #saveArrayQuestions.
   * @param items array of object to parse
   */
  importQuestions(items: any[]) {
    this.loading = true;
    const blocksWithQuestions = this.mapFile(items);
    this.saveArrayQuestions(blocksWithQuestions)
      .finally(() => {
        this.loading = false;
        this.loadQuestions();
      });
  }

  /**
   * Saves array of data in data base. The data can be provided from external file or from
   * multiple rows form.
   * @param file obtained from form array or array form.
   */
  saveArrayQuestions(file: BlockType[]) {
    let currentBlockId: number;

    if (!file) {
      return;
    }

    return Promise.all(file.map(async (block, idx) => {
        await this.hasQblock(block.name, this.stationId)
          .then(async (result) => {
            if (result && (<Array<any>>result).length === 1) {
              currentBlockId = result[0]['id'];
              return await this.addQuestions(block.questions, currentBlockId);
            } else if (!result) {
              return await this.addQblock(block.name, (idx + 1))
                .then(async res => {
                  currentBlockId = res['id'];
                  return await this.addQuestions(block.questions, currentBlockId);
                })
                .catch(err => this.logPromisesERROR.push({value: block.name, reason: err}));
            }
          })
          .catch(err => this.logPromisesERROR.push({value: block.name, reason: err}));
      })
    );

  }

  /**
   * Checks if the name of the block already exists or not.
   * if there are more than one result, will return an exception
   * @param name of the block to verify if exists
   * @param station whose block name to search
   */
  hasQblock(name: string, station: number) {
    return new Promise((resolve, reject) => {
      QBlock.query({
        where: {name: name, station: station}
      }, {skip: [], cache: false})
        .then((response: Array<any>) => {
          if (response.length === 1) {
            resolve(response);
          } else if (response.length === 0) {
            resolve(false);
          } else if (response.length > 1) {
            reject('TOO_MANY_ROWS');
          }
        })
        .catch(err => reject(err));
    });
  }

  /**
   * Method to add a new block
   * @param name the name of the block
   * @param order his order position
   */
  addQblock(name: string, order: number) {
    const qblock = new QBlock({name: name, station: this.stationId, order: order});
    return qblock.save()
      .catch(reason => {
        this.logPromisesERROR.push({value: qblock, reason: reason});
        return reason;
      });
  }

  /**
   * Adds question by question with them options.
   * @param items array of questions
   * @param idBlock which questions will be asociated
   */
  async addQuestions(items: any[], idBlock: number) {
    for (const item of items) {
      const body = {
        area: (await Area.first({where: {code: (item[this.HEADER.ac] + ''), ecoe: this.ecoeId}})),
        description: item[this.HEADER.description],
        options: [],
        order: item[this.HEADER.order],
        qblocks: [idBlock],
        question_type: item[this.HEADER.type],
        reference: item[this.HEADER.reference]
      };

      await (new Question(body)).save()
        .then((question) => this.addOptions(<Array<any>>item, question.id))
        .catch(reason => {
          this.logPromisesERROR.push({
            value: new Question(body),
            reason: reason
          });
          return reason;
        });
    }

    return new Promise((resolve) => resolve('ALL'));
  }

  /**
   * For every question adds all the options asociated.
   * @param questionItem question object row
   * @param idQuestion to asociate with the options
   */
  addOptions(questionItem: any[], idQuestion: number) {
    const savePromises = [];

    const options = questionItem[this.OPTIONS];

    if (options.length === 0) {
      const body = {
        label: this.DEFAULT_LABEL,
        order: 1,
        points: questionItem[this.POINTS],
        question: idQuestion
      };

      const promise = (new Option(body)).save()
        .then(result => result)
        .catch(err => this.logPromisesERROR.push({
          value: body,
          reason: err
        }));

      savePromises.push(promise);
    } else {
      options.forEach((item, idx) => {
        const body = {
          label: (item[this.OPTION + (idx + 1)]).toString(),
          order: idx,
          points: item[this.POINTS + (idx + 1)],
          question: idQuestion
        };

        const promise = (new Option(body)).save()
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
      });
    }
    return Promise.all(savePromises)
      .then(() =>
        new Promise((resolve, reject) =>
          this.logPromisesERROR.length > 0 ? reject(this.logPromisesERROR) : resolve(this.logPromisesOK)))
      .catch(err =>
        new Promise(((resolve, reject) => reject(err))));
  }

  /**
   * Resets the array of promise errors when tried to save on
   * data base.
   */
  clearImportErrors() {
    this.logPromisesERROR = [];
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

interface BlockType {
  name: string;
  questions: Question[];
}
