import {Injectable} from '@angular/core';
import {
  Area,
  Block,
  Option,
  RowQuestion,
  Station,
  BlockType,
  Question,
  QuestionSchema,
  QuestionBase,
  QuestionRange, QuestionCheckBox, QuestionRadio, QuestionOption, ECOE
} from '../../models';
import {Pagination} from '@openecoe/potion-client';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  // tslint:disable-next-line:max-line-length
  private readonly HEADER: { order: string, description: string, reference: string, points: string, ac: string, type: string, block: string, range: string } = {
    order: 'order',
    description: 'description',
    reference: 'reference',
    points: 'points',
    ac: 'area',
    type: 'questionType',
    block: 'block',
    range: 'range'
  };

  private readonly DEFAULT_LABEL = 'Sí';
  private readonly OPTIONS = 'options'; // PROPERTY NAME ADDED TO QUESTIONS ARRAY.
  private readonly OPTION = 'option';
  private readonly POINTS = 'points';

  private logPromisesERROR: any[] = [];
  private logPromisesOK: any[] = [];

  constructor() {
  }


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
  private async saveImportedItems(file: BlockType[], station: Station) {
    if (!file) {
      return;
    }

    try {
      for (const block of file) {
        let _block = await this.hasQblock(block.name, station);
        if (!_block) {
          _block = await this.addQblock(block.name, null, station);
        }
        this.addQuestions(block.questions, _block).catch(err => this.logPromisesERROR.push({value: block.name, reason: err}));
      }
    } catch (error) {
      this.logPromisesERROR.push({value: file, reason: error})
    }
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
  private async hasQblock(name: string, station: Station) {
    try {
      const _block = await Block.first<Block>({where: {name: name, station: station}});
      return _block;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Method to add a new block
   * @param name the name of the block
   * @param order his order position
   * @param station station
   */
  async addQblock(name: string, order: number, station: Station) {
    try {
      if (!order) {
        //Recuperamos el orden del ultimo bloque
        const _pagBlocks = await Block.query({where: {station: station}, page: 1, perPage: 1},{paginate: true, cache: false}) as Pagination<Block>;
        order = _pagBlocks.total + 1;
      }
      const qblock = new Block({name: name, station: station, order: order});
      return qblock.save()
      
    } catch (error) {
      this.logPromisesERROR.push({value: name, reason: error});
      return error;
      
    }

    


    
  }

  private async getArea(area: Area | String, ecoe: ECOE | number): Promise<Area> {
    return (area instanceof Area) ? area : (await Area.first({where: {code: (area + ''), ecoe: ecoe}}));
  }

  private async addOptions(questionItem: RowQuestion, idQuestion: number) {
    // const _schema = new QuestionSchema(questionItem.questionType);
    //
    // if (_schema instanceof QuestionBase) {
    //   _schema.reference = questionItem.reference;
    //   _schema.description = item[this.HEADER.reference];
    // }
    // if (_schema instanceof QuestionRange) {
    //   _schema.range = item[this.OPTIONS].length;
    //   _schema.max_points = item[this.HEADER.points];
    // } else if (_schema instanceof QuestionRadio || _schema instanceof QuestionCheckBox) {
    //   // _schema.max_points = item[this.HEADER.points];
    //   const _options = item[this.OPTIONS];
    //
    //   for (const { index, value } of _options.map((opt, idx) => ({ idx, opt }))) {
    //     const _questionOption = new QuestionOption();
    //
    //     _questionOption.id_option = index;
    //     _questionOption.points = value.points;
    //     _questionOption.label = value.label;
    //     _questionOption.order = value.order ? value.order : index;
    //
    //     _schema.options.push(_questionOption);
    //   }


      // const body = {
      //   label: ((item[this.OPTION + (idx + 1)])) ? (item[this.OPTION + (idx + 1)]).toString() : item['label'],
      //   order: (item[this.HEADER.order]) ? item[this.HEADER.order] : idx,
      //   points: (item[this.POINTS + (idx + 1)]) ? (item[this.POINTS + (idx + 1)]) : item[this.POINTS],
      //   question: idQuestion
      // };


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
   * Build schema from RowQuestion
   * @param item RowQuestion
   */
  buildSchema(item: RowQuestion): QuestionSchema {
    try {
      const _schema = new QuestionSchema(item.questionType as string);

      if (_schema instanceof QuestionBase) {
        _schema.reference = item[this.HEADER.reference];
        _schema.description = item[this.HEADER.description];
      }
      if (_schema instanceof QuestionRange) {
        
        const getRateCount = () => {
          const _options = item[this.OPTIONS];
          if (_options) {
            return _options['ratecount'];
          } else {
            return 10;
          }
        }
          
        _schema.range = item[this.HEADER.range] || getRateCount();
        
        _schema.max_points = item[this.HEADER.points];
      } else if (_schema instanceof QuestionRadio || _schema instanceof QuestionCheckBox) {
        const _options = item[this.OPTIONS];
  
        if (_options.length === 0) {
          _options.push(
            new Option({
              points: item[this.HEADER.points],
              label: this.DEFAULT_LABEL,
            })
          );
        }
  
        // tslint:disable-next-line:no-shadowed-variable
        for (const { idx, opt } of _options.map((opt, idx) => ({ idx: idx + 1, opt }))) {
          const _questionOption = new QuestionOption();
  
          _questionOption.id_option = idx;
          _questionOption.points = opt.points || opt[`points${idx}`];
          _questionOption.label = opt.label || opt[`option${idx}`];
          _questionOption.order = opt.order ? opt.order : idx;
  
          _schema.options.push(_questionOption);
        }
      }
      return _schema;
    } catch (error) {
      this.logPromisesERROR.push({
        value: item,
        reason: error
      });
      throw error;
    }

    
  }

  /**
   * Conversion of rowQuestion to new model Question.
   * @param rowQuestion to convert
   * @param station optional to allow pass station with qblock null
   */
  async rowQuestiontoQuestion(rowQuestion: RowQuestion, station: Station): Promise<Question> {
    const _question = new Question();

    _question.area = (await this.getArea(rowQuestion[this.HEADER.ac], station.ecoe));
    
    //Si no hay area devolvemos un error y marcamos que no se puede realizar la importación
    if (!_question.area) {
      this.logPromisesERROR.push({
        value: rowQuestion,
        reason: 'No se ha encontrado el área'
      });
      return null;
    }

    _question.station = station;
    _question.order = rowQuestion[this.HEADER.order];
    _question.block = rowQuestion[this.HEADER.block];
    _question.schema = this.buildSchema(rowQuestion);

    return _question;

  }

  /**
   * Adds question by question with them options.
   * @param items array of questions
   * @param block which questions will be asociated
   */
  async addQuestions(items: Question[] | RowQuestion[], block: Block) {
    for (const item of items) {
      item[this.HEADER.block] = block;
      const _question = item instanceof Question ? item : await this.rowQuestiontoQuestion(item, block.station);

      await _question.save()
        .then(async (question) => {
          this.logPromisesOK.push(question);
        })
        .catch(reason => {
          this.logPromisesERROR.push({
            value: _question,
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
      const _data = {
        area: item.area,
        order: item.order,
        block: item.block,
        schema: this.buildSchema(item),
      };

      await questionResponse.update(_data);
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
  saveArrayQblocks(items: any[], stationId: number | string, n_qblocks: number): Promise<any> {
    const savePromises = [];
    this.logPromisesERROR = [];
    this.logPromisesOK = [];

    items.forEach((item, idx) => {
      if (item.name) {
        item['station'] = stationId;
        item['order'] = n_qblocks + (idx + 1);

        const qblock = new Block(item);

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
   * @param question source where will be deleted
   */
  async deleteQuestion(question: Question) {
    return question.destroy();
  }

  loadQuestions(blockId: number, paginate: boolean, page: number = 1, perPage: number = 20) {
    return Question.query<Question, Pagination<Question>>({
        where: {block: blockId},
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

    Block.query({
      where: {station: station.id},
      sort: {order: false}
    }, {
      cache: false,
      skip: []
    })
      .then((qblocks: Block[]) => {
        for (const qblock of qblocks) {
          Question.query({
            where: {block: qblock},
            sort: {order: false},
          }, {
            paginate: false,
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
                if (counterNext === qblocks.length) {
                  setTimeout(() => questionsObservable.complete(), 200);
                }
              }
            });
        }
      });
    return questionsObservable;
  }
}
