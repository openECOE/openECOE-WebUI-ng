import { Injectable } from '@angular/core';
import {Area, QBlock, Question, Option, RowQuestion, Station, BlockType} from '../../models';
import {Pagination} from '@openecoe/potion-client';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  private readonly HEADER: { order: string, description: string, reference: string, points: string, ac: string, type: string } = {
    order: 'order',
    description: 'description',
    reference: 'reference',
    points: 'points',
    ac: 'area',
    type: 'questionType'
  };

  private readonly DEFAULT_LABEL = 'Sí';
  private readonly OPTIONS = 'options'; // PROPERTY NAME ADDED TO QUESTIONS ARRAY.
  private readonly OPTION = 'option';
  private readonly POINTS = 'points';

  private logPromisesERROR: any[] = [];
  private logPromisesOK: any[] = [];

  constructor() { }


  /**
   * Simple method that calls #mapFile for map initial array to specific structure
   * and later calls #saveArrayQuestions.
   * @param items array of object to parse
   * @param station station object
   */
  importQblockWithQuestions(items: any[], station: Station) {
    const blocksWithQuestions = this.mapFile(items);
    return this.saveImportedItems(blocksWithQuestions, station);
  }

  /**
   * convert a simple array of objects to specific structure (grouped by block names and questions)
   * currently blockname is true when the object has description but doesnt has the order number.
   * in other case, for identify an question, that must have next properties: order, description and points.
   * @param items array of items to parse
   */
  private mapFile(items: any[]) {
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
   * Saves array of data in data base. The data can be provided from external file or from
   * multiple rows form.
   * @param file obtained from form array or array form.
   * @param stationId id of the station.
   */
  private saveImportedItems(file: BlockType[], station: Station) {
    let currentBlockId: number;

    if (!file) {
      return;
    }

    return Promise.all(file.map(async (block, idx) => {
        await this.hasQblock(block.name, station)
          .then(async (result) => {
            if (result && (<Array<any>>result).length === 1) {
              currentBlockId = result[0]['id'];
              return await this.addQuestions(block.questions, currentBlockId, station);
            } else if (!result) {
              return await this.addQblock(block.name, (idx + 1), station)
                .then(async res => {
                  currentBlockId = res['id'];
                  return await this.addQuestions(block.questions, currentBlockId, station);
                })
                .catch(err => this.logPromisesERROR.push({value: block.name, reason: err}));
            }
          })
          .catch(err => this.logPromisesERROR.push({value: block.name, reason: err}));
      })
    );
  }

  /**
   * Obtains for every question, all options available (radio buttons, range selects and checkboxs)
   * @param item is a question row
   */
  private getOptions(item: object) {
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
   * Checks if the name of the block already exists or not.
   * if there are more than one result, will return an exception
   * @param name of the block to verify if exists
   * @param station whose block name to search
   */
  private hasQblock(name: string, station: Station) {
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
   * @param station station
   */
  addQblock(name: string, order: number, station: Station) {
    const qblock = new QBlock({name: name, station: station, order: order});
    return qblock.save()
      .catch(reason => {
        this.logPromisesERROR.push({value: qblock, reason: reason});
        return reason;
      });
  }

  private async getArea(area: Area | string, ecoe: number) {
    return (area instanceof Area) ? area : (await Area.first({where: {code: (area + ''), ecoe: ecoe}}));
  }

  private async addOptions(questionItem: RowQuestion, idQuestion: number) {
    const savePromises = [];
    const options = questionItem[this.OPTIONS];
    if (options && options.length === 0) {
      const body = {
        label: this.DEFAULT_LABEL,
        order: 1,
        points: questionItem[this.POINTS],
        question: idQuestion
      };
      const promise = await (new Option(body)).save()
        .then(result => result)
        .catch(err => this.logPromisesERROR.push({
          value: body,
          reason: err
        }));
      savePromises.push(promise);
    } else {
      let idx = 0;
      for (const item of options) {
        const body = {
          label: ((item[this.OPTION + (idx + 1)])) ? (item[this.OPTION + (idx + 1)]).toString() : item['label'],
          order: (item[this.HEADER.order]) ? item[this.HEADER.order] : idx,
          points: (item[this.POINTS + (idx + 1)]) ? (item[this.POINTS + (idx + 1)]) : item[this.POINTS],
          question: idQuestion
        };
         await (new Option(body)).save()
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
        idx++;
      }
    }
    return new Promise((resolve, reject) =>
      this.logPromisesERROR.length > 0 ? reject(this.logPromisesERROR) : resolve(this.logPromisesOK));
  }

  /**
   * Adds question by question with them options.
   * @param items array of questions
   * @param idBlock which questions will be asociated
   */
  async addQuestions(items: any[], idBlock: number, station: Station) {
    for (const item of items) {
      const body = {
        area: (await this.getArea(item[this.HEADER.ac], station.ecoe.id)),
        description: item[this.HEADER.description],
        options: [],
        order: item[this.HEADER.order],
        qblocks: [idBlock],
        question_type: item[this.HEADER.type],
        reference: item[this.HEADER.reference]
      };

      await (new Question(body)).save()
        .then(async (question) => {
          this.logPromisesOK.push(question);

          await this.addOptions(item, question.id);
        })
        .catch(reason => {
          this.logPromisesERROR.push({
            value: new Question(body),
            reason: reason
          });
          return reason;
        });
    }
    return new Promise((resolve, reject) =>
      this.logPromisesERROR.length > 0 ? reject(this.logPromisesERROR) : resolve(this.logPromisesOK));
  }

  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   *
   * @param item Resource selected
   */
  async updateQuestion(item: RowQuestion) {
    const question = Question.fetch(item.id as number);

    await question.then(async (questionResponse: Question) => {
      await questionResponse.update({
        description: item.description,
        area: item.area,
        order: item.order,
        questionType: item.questionType,
        reference: item.reference
      });

      await this.deleteOptions(questionResponse.options);

      await this.addOptions(item, questionResponse.id);
    });
  }

  private async deleteOptions(options: Option[]) {
    for (const option of options) {
      await new Option(option).destroy()
        .catch(err => console.error(err));
    }
  }

  /**
   * Saves array of data in data base. The data can be provided from external file or from
   * multiple rows form.
   * @param items obtained from form array or array form.
   * @param stationId the id of the station.
   * @param n_qblocks total count of qblocks.
   */
  saveArrayQblocks(items: any[], stationId: number, n_qblocks: number): Promise<any> {
    const savePromises = [];
    this.logPromisesERROR = [];
    this.logPromisesOK = [];

    items.forEach((item, idx) => {
      if (item.name) {
        item['station'] = stationId;
        item['order'] = n_qblocks + (idx + 1);

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
          this.logPromisesERROR.length > 0 ? reject(this.logPromisesERROR) : resolve(this.logPromisesOK)))
      .catch(err => new Promise(((resolve, reject) => reject(err))));
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayQuestions]{@link #updateArrayQuestions} function.
   *
   * @param questions source where will be deleted
   * @param id Resource selected
   */
  async deleteQuestion(questions: Question[], id: number) {
    const idx = questions.map(item => item.id).indexOf(id);
    const options: Option[] = (questions[idx].options) ? questions[idx].options : [];

    if (options.length > 0) {
      for (const option of options) {
        await option.destroy();
      }
    }
    return questions[idx].destroy();
  }

  loadQuestions(blockId: number, paginate: boolean, page: number = 1, perPage: number = 20) {
    return Question.query<Question, Pagination<Question>>({
        where: {qblocks: {$contains: blockId}},
        sort: {order: false},
        page: page,
        perPage: perPage
      },
      {
        paginate: paginate,
        cache: false
      });
  }

  getQuestionsByStation(station: Station): Observable<BlockType[]> {
    const questionsByBlock: BlockType[] = [];
    const questionsObservable = new BehaviorSubject<BlockType[]>(questionsByBlock);
    let counterNext = 0;

      QBlock.query({
        where: {station: station.id},
        sort: {order: false}
        }, {
        cache: false,
        skip: []
      })
      .then((qblocks: QBlock[]) => {
        for (const qblock of qblocks) {
          Question.query({
            where: {qblocks: {$contains: qblock}},
            sort: {order: false},
        }, {paginate: false,
            cache: false,
            skip: ['area']
          })
          .then((questions: Question[]) => {
            questionsByBlock.push({
              name: qblock.name,
              order: qblock.order,
              questions: questions
            });
            counterNext++;
            if (counterNext <= qblocks.length) {
              questionsObservable.next(questionsByBlock.sort((a, b) => a['order'] - b['order']));
              if (counterNext === qblocks.length) { setTimeout(() => questionsObservable.complete(), 200); }
            }
          });
        }
      });
    return questionsObservable;
  }
}
