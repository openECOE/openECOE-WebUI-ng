import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Area, Option, QBlock, Question, RowQuestion} from '../../models';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {RowQblock} from '../../pages/admin/ecoe/questions/questions.component';

@Component({
  selector: 'app-qblock-question-form',
  templateUrl: './qblock-question-form.component.html',
  styleUrls: ['./qblock-question-form.component.less']
})
export class QblockQuestionFormComponent implements OnInit {

  @Input() id_station: number;
  @Input() n_qblocks: number;

  @Output() saved: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('question') questionRef;
  @ViewChild('qblock') qblockRef;

  private current = 0;

  private qblocksToAdd: QBlock[] = [];
  private questionsToAdd: any[] = [];

  private qblockForm: FormGroup;
  private control: FormArray;

  private rowQblock: RowQblock = {
    name: ['', Validators.required]
  };

  private loading: boolean;
  private logPromisesERROR: any[] = [];
  private logPromisesOK: any[] = [];

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

  constructor(private fb?: FormBuilder) { }

  ngOnInit() {
    this.qblockForm = this.fb.group({
      qblockRow: this.fb.array([])
    });

    this.control = <FormArray>this.qblockForm.controls.qblockRow;

    this.InitQblockRow();
  }

  /**
   * Before save values in data base, in first time checks that
   * all fields are validates and then will save the values.
   */
  submitForm() {
    if (this.getCurrent() !== 2) {
      if (!this.validQuestions()) { return new Promise((resolve, reject) => reject(false)); }
    }
    return this.saveArrayQblocks(this.qblocksToAdd)
      .catch((err) => new Promise((resolve, reject) => reject(err)) )
      .then(result => this.addQuestions(this.questionsToAdd, result[0].id) );
  }

  pre(): void {
    this.current -= 1;
  }

  next(): void {
    this.current += 1;
  }

  getCurrent() {
    return this.current;
  }

  resetCurrent() {
    this.current = 0;
  }

  save() {
    this.submitForm()
      .then( () => {
        this.saved.next(true);
        this.resetForm();
      })
      .catch((e) => console.warn(e));
  }

  resetForm() {
    this.resetCurrent();
    this.qblocksToAdd = [];
    this.questionsToAdd = [];
  }

  validQblocks() {
    let valid = false;
    if (this.qblockRef.submitForm()) {
      this.next();
      valid = true;
    }
    return valid;
  }

  preview() {
    if (this.validQuestions()) {
      this.current++;
    }
  }

  validQuestions() {
    let valid = false;
    if (this.questionRef.submitForm()) {
      valid = true;
    }
    return valid;
  }

  onGetQblocks(data: QBlock[]) {
    this.qblocksToAdd = data;
  }

  onGetQuestions(data: any[]) {
    this.questionsToAdd = data;
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

  /**
   * Closes the form qblock window
   */
  closeDrawer() {
    // this.isVisible = false;
    this.saved.next(false);
    this.resetForm();
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
        item['station'] = this.id_station;
        item['order'] = this.n_qblocks + (idx + 1);

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
   * Adds new row (name field) qblock to the form
   */
  addQblockRow() {
    this.control.push(this.fb.group(this.rowQblock));
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
   * Deletes selected row qblock whose was added previously
   * @param index id field to find and remove.
   */
  deleteRow(index) {
    this.control.removeAt(index);
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
        await this.hasQblock(block.name, this.id_station)
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
   * Simple method that calls #mapFile for map initial array to specific structure
   * and later calls #saveArrayQuestions.
   * @param items array of object to parse
   */
  importQuestions(items: any[]) { console.log('importQuestions:', items);
    this.loading = true;
    const blocksWithQuestions = items; // this.mapFile(items);
    console.log('importQuestions:parsed', blocksWithQuestions);
    // return;
    this.saveArrayQuestions(blocksWithQuestions)
      .finally(() => {
        this.loading = false;
        // this.loadQuestions();
      });
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
    const qblock = new QBlock({name: name, station: this.id_station, order: order});
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
  async addQuestions(items: any[], idBlock: number) { console.log('addQuestions', items, idBlock);
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

  async deleteOptions(options: Option[]) {
    // (options).forEach(option => {
    for (const option of options) {
      await new Option(option).destroy()
        .catch(err => console.error(err));
    }
  }

  /**
   * For every question adds all the options asociated.
   * @param questionItem question object row
   * @param idQuestion to asociate with the options
   */
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
   * Resets the array of promise errors when tried to save on
   * data base.
   */
  clearImportErrors() {
    this.logPromisesERROR = [];
  }
}


interface BlockType {
  name: string;
  questions: Question[];
}
