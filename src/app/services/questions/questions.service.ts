import { Injectable } from '@angular/core';
import {Area, QBlock, Question, Option, RowQuestion} from '../../models';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  readonly HEADER: { order: string, description: string, reference: string, points: string, ac: string, type: string } = {
    order: 'order',
    description: 'description',
    reference: 'reference',
    points: 'points',
    ac: 'area',
    type: 'questionType'
  };

  readonly DEFAULT_LABEL = 'Sí';
  readonly OPTIONS = 'options'; // PROPERTY NAME ADDED TO QUESTIONS ARRAY.
  readonly OPTION = 'option';
  readonly POINTS = 'points';

  private logPromisesERROR: any[] = [];
  private logPromisesOK: any[] = [];

  constructor() { }


  /**
   * Simple method that calls #mapFile for map initial array to specific structure
   * and later calls #saveArrayQuestions.
   * @param items array of object to parse
   * @param stationId id of the station
   */
  importQblockWithQuestions(items: any[], stationId: number) {
    const blocksWithQuestions = this.mapFile(items);
    console.log('importQuestions:', blocksWithQuestions);
    return this.saveImportedItems(blocksWithQuestions, stationId);
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
  private saveImportedItems(file: BlockType[], stationId: number) {
    let currentBlockId: number;

    if (!file) {
      return;
    }

    return Promise.all(file.map(async (block, idx) => {
        await this.hasQblock(block.name, stationId)
          .then(async (result) => {
            if (result && (<Array<any>>result).length === 1) {
              currentBlockId = result[0]['id'];
              return await this.addQuestions(block.questions, currentBlockId);
            } else if (!result) {
              return await this.addQblock(block.name, (idx + 1), stationId)
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
  private hasQblock(name: string, station: number) {
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
   * @param stationId id of the station
   */
  addQblock(name: string, order: number, stationId: number) {
    const qblock = new QBlock({name: name, station: stationId, order: order});
    return qblock.save()
      .catch(reason => {
        this.logPromisesERROR.push({value: qblock, reason: reason});
        return reason;
      });
  }

  async getArea(area: any) {
    return (area instanceof Area) ? area : (Area.first({where: {code: (area + '')}}));
  }

  /**
   * Adds question by question with them options.
   * @param items array of questions
   * @param idBlock which questions will be asociated
   */
  async addQuestions(items: any[], idBlock: number) {
    for (const item of items) {
      const body = {
        area: (await this.getArea(item[this.HEADER.ac])),
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
          // await this.addOptions(<Array<any>>item, question.id);
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

  async addOptions(questionItem: RowQuestion, idQuestion: number) {
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
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   *
   * @param item Resource selected
   */
  async updateQuestion(item: RowQuestion) {
    const question = Question.fetch(item.id as number);

    await question.then(async (questionResponse) => {
      await questionResponse.update({
        description: item.description,
        area: item.area,
        order: item.order,
        questionType: item.questionType,
        reference: item.reference
      });

      await this.deleteOptions(questionResponse.options);

      await this.addOptions(item, questionResponse.id as number);
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
}

interface BlockType {
  name: string;
  questions: Question[];
}
