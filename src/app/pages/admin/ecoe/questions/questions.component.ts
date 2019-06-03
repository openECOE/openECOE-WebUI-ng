import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {ApiService} from '../../../../services/api/api.service';
import {forkJoin, from, Observable} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import {SharedService} from '../../../../services/shared/shared.service';
import {Area, ECOE, QBlock, Question, Station, Option} from '../../../../models';
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
  editCacheOption = {};
  editCache = {};
  ecoeId: number;
  qblockId: number;
  stationId: number;
  questionShowQblocks = {};
  valueopt: number;


  index: number = 1;
  indexOpt: number = 1;

  question_type_options: Array<{ type: string, label: string }> = [
    {type: 'RB', label: 'ONE_ANSWER'},
    {type: 'CH', label: 'MULTI_ANSWER'},
    {type: 'RS', label: 'VALUE_RANGE'}
  ];

  readonly HEADER: { order: string, description: string, reference: string, points: string, ac: string, type: string } = {
    order:       'orden',
    description: 'enunciado',
    reference:   'referencia',
    points:      'points',
    ac:          'ac',
    type:        'type'
  };

  readonly DEFAULT_LABEL = 'Sí';
  readonly OPTIONS  = 'options'; // PROPERTY NAME ADDED TO QUESTIONS ARRAY.
  readonly OPTION   = 'option';
  readonly POINTS   = 'points';

  private logPromisesERROR: any[] = [];
  private logPromisesOK: any[] = [];

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              private sharedService: SharedService) {
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
  }

  /**
   * Load questions by the passed Station and ECOE.
   * Loads all the stations, then filters by the station passed on the URL and loads their qblocks.
   * Finally, loads the questions for each Qblock and creates the multi-level array.
   */
  async loadQuestions() {
    // TODO: Only fetch 10 questions per station, need to create pagination for questions
    this.ecoe = await ECOE.fetch<ECOE>(this.ecoeId);

    const pagStations = await this.ecoe.stations({}, {paginate: true, cache: false});
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
   * Sets the editCacheOption variable to true.
   * Changes text-view tags by input tags.
   *
   * @param id Id of the selected resource
   */
  startEditOption(id: number) {
    this.editCacheOption[id].edit = true;
  }

  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again and sorts the array.
   *
   * @param option Resource selected
   * @param question Parent resource passed
   * @param newItem determines if the resource is already saved
   */
  saveOption(option: any, question: any, newItem: boolean) {
    const item = this.editCacheOption[option.id];

    if (!item.order || !item.label || !item.points) {
      return;
    }

    const body = {
      order: +item.order,
      label: item.label,
      points: +item.points,
      question: question.id
    };

    const request = (
      newItem ?
        this.apiService.createResource('option', body) :
        this.apiService.updateResource(item['$uri'], body)
    );

    request.subscribe(response => {
      delete this.editCacheOption[option.id];
      delete this.editCacheOption[response['id']];

      this.editCacheOption[response['id']] = {
        edit: false,
        ...response
      };

      question.optionsArray = question.optionsArray
        .map(x => (x.id === option.id ? response : x))
        .sort(this.sharedService.sortArray);
    });
  }

  /**
   * Sets the editCacheOption variable to false.
   * If resource is not already saved, calls [updateArrayOptions]{@link #updateArrayOptions} function.
   * Else resets editCache to the previous value.
   *
   * @param option Resource selected
   * @param question Parent resource passed
   */
  cancelEditOption(option: any, question: any) {
    this.editCacheOption[option.id].edit = false;

    if (this.editCacheOption[option.id].new_item) {
      this.updateArrayOptions(option.id, question);
    } else {
      this.editCacheOption[option.id] = option;
    }
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayOptions]{@link #updateArrayOptions} function.
   *
   * @param option Resource selected
   * @param question Parent resource passed
   */
  deleteOption(option: any, question: any) {
    this.apiService.deleteResource(option['$uri']).subscribe(() => {
      this.updateArrayOptions(option.id, question);
    });
  }

  /**
   * Deletes the editCacheOption key assigned to the resource id passed, filters out the item from the resources array and sorts the array.
   *
   * @param option Id of the resource passed
   * @param question Parent resource passed
   */
  updateArrayOptions(option: number, question: any) {
    delete this.editCacheOption[option];
    question.optionsArray = question.optionsArray
      .filter(x => x.id !== option)
      .sort(this.sharedService.sortArray);
  }

  /**
   * Adds a new empty field to the resources array.
   * Then updates editCacheOption with the new resource.
   *
   * @param question Parent resource passed
   */
  addOption(question: any) {
    this.apiService.getResources('option')
      .subscribe(options => {
        this.indexOpt += this.sharedService.getLastIndex(options);

        const newItem = {
          id: this.indexOpt,
          order: '',
          label: '',
          points: 0,
          question: question.id
        };

        question.optionsArray = [...question.optionsArray, newItem];

        this.editCacheOption[this.indexOpt] = {
          edit: true,
          new_item: true,
          ...newItem
        };
      });
  }

  /**
   * Moves the option one position above or down.
   * Updates the order key of the resource passed and the next to it.
   * Then updates the variables to avoid calling the backend again and sorts the array.
   *
   * @param direction 'up' or 'down'
   * @param option Resource passed
   * @param index Current index of the selected resource
   * @param question Parent resource passed
   */
  changeOptionOrder(direction: string, option: any, index: number, question: any) {
    const itemToMove = (direction === 'up') ? question.optionsArray[index - 1] : question.optionsArray[index + 1];

    forkJoin(
      this.apiService.updateResource(option['$uri'], {order: itemToMove.order}),
      this.apiService.updateResource(itemToMove['$uri'], {order: option.order})
    ).subscribe(response => {
      response.forEach(res => {
        this.editCacheOption[res['id']] = res;

        question.optionsArray = question.optionsArray
          .map(x => (x.id === res.id ? res : x))
          .sort(this.sharedService.sortArray);
      });
    });
  }

  /**
   * Removes the Qblock filter and reloads the page by updating the URL.
   *
   * @param station Id of the station passed
   */
  deleteFilter(station: number) { console.log('deleteFilter:', station);
    this.router.navigate(['../questions'], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {station: station}
    }).finally();
  }

  mapFile(items: any[]) {
    const newArr: any[] = [];
    const currentBlock: { name: string; questions: any[] } = { name: '', questions: [] };
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

  getOptions(item: object) {
    Object.keys(item).forEach((key) => (item[key] == null) && delete item[key]);

    const propertyNames = Object.getOwnPropertyNames(item);

    const options = propertyNames.filter(value => value.toLowerCase().match(/option\d+$/) );
    const points = propertyNames.filter(value => value.toLowerCase().match(/points\d+$/) );

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

  importQuestions(items: any[]) {
    const blocksWithQuestions = this.mapFile(items);
    this.saveArrayQuestions(blocksWithQuestions);
  }

  /**
   * Saves array of data in data base. The data can be provided from external file or from
   * multiple rows form.
   * @param file obtained from form array or array form.
   */
  saveArrayQuestions(file: BlockType[]) {
    this.logPromisesERROR = [];
    this.logPromisesOK    = [];
    let currentBlockId: number;

    if (!file) { return; }

    file.forEach(async (block, idx) => {
      await this.hasQblock(block.name, this.stationId)
        .then( async (result) => {
          if (result && (<Array<any>>result).length === 1) {
            currentBlockId = result[0]['id'];
            return this.addQuestions(block.questions, currentBlockId);
          } else if (!result) {
              await this.addQblock(block.name, (idx + 1) )
                .then(async res => {
                  currentBlockId = res['id'];
                  return this.addQuestions(block.questions, currentBlockId);
                })
                .catch(err => console.error('ERROR ON ADD:', err));
          }
        });
    });
  }

  hasQblock(name: string, station: number) {
    return new Promise((resolve, reject) => {
      QBlock.query({
        where: { name: name, station: station }
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

  addQblock(name: string, order: number) {
    return ( new QBlock({name: name, station: this.stationId, order: order }) ).save();
  }


  addQuestions(items: any[], idBlock: number) {
    this.logPromisesERROR = [];
    this.logPromisesOK    = [];

    items.forEach( async (item) => {
      const body = {
        area:         (await Area.first({where: {code: (item[this.HEADER.ac] + ''), ecoe: this.ecoeId } })),
        description:  item[this.HEADER.description],
        options:      [],
        order:        item[this.HEADER.order],
        qblocks:      [idBlock],
        question_type: item[this.HEADER.type],
        reference:    item[this.HEADER.reference]
      };

      await (new Question(body)).save()
        .then(async (question) => {
          await new Promise(resolve => {
            this.addOptions(<Array<any>>item, question.id)
              .then((res) => {
                this.logPromisesOK.push(res);
                resolve(res);
              });
          });
        })
        .catch(reason => {
          console.error(reason);
        });
    });
    return new Promise((resolve) => resolve('ALL'));
  }

  addOptions(questionItem: any[], idQuestion: number) {
    const savePromises    = [];
    this.logPromisesERROR = [];
    this.logPromisesOK    = [];

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
        .catch(err => err);

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
          this.logPromisesERROR.length > 0 ? reject(this.logPromisesERROR) : resolve(this.logPromisesOK)) )
      .catch(err =>
        new Promise(((resolve, reject) => reject(err))));
  }

}

interface BlockType {
 name: string;
 questions: Question[];
}
