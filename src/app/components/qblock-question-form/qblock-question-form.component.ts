import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Area, Option, QBlock, Question} from '../../models';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {RowQblock} from '../../pages/admin/ecoe/questions/questions.component';
import { QuestionFormComponent } from '.././qblock-question-form/question-form/question-form.component';

@Component({
  selector: 'app-qblock-question-form',
  templateUrl: './qblock-question-form.component.html',
  styleUrls: ['./qblock-question-form.component.less'],
  providers: [QuestionFormComponent]
})
export class QblockQuestionFormComponent implements OnInit {
  current = 0;
  isVisible: boolean = false;

  private qblocksToAdd: QBlock[] = [];
  private questionsToAdd: any[] = [];

  qblockForm: FormGroup;
  control: FormArray;

  rowQblock: RowQblock = {
    name: ['', Validators.required]
  };

  loading: boolean;


  logPromisesERROR: any[] = [];
  logPromisesOK: any[] = [];

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


  /* FORM STEPS SETTINGS --END */

  @Input() id_station: number;
  @Input() n_qblocks: number;

  @ViewChild('question') questionRef;
  @ViewChild('qblock') qblockRef;

  constructor(private fb: FormBuilder) { }

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
  submitForm(): void { console.log('click en submit');
    if (this.questionRef.mySubmit()) {
      console.log('station-details:onSubmit');
    }
  }

  pre(): void {
    this.current -= 1;
  }

  next(): void {
    this.current += 1;
  }

  done(): void {
    console.log('done');
  }

  submitQblocks() {
    if (this.qblockRef.submitForm()) {
      this.next();
    }
  }

  submitQuestions() {
    if (this.questionRef.submitForm()) {
      this.saveArrayQblocks(this.qblocksToAdd)
        .catch(err => console.warn(err))
        .then(result => {
          this.addQuestions(this.questionsToAdd, result[0].id)
            .then(response => console.log(response))
            .catch(err => console.log(err));
        });
    }
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

    this.current = -1;
  }

  /**
   * Closes the form qblock window
   */
  closeDrawer() {
    this.isVisible = false;
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
        item['order'] = this.n_qblocks + idx;

        const qblock = new QBlock(item);

        const promise = qblock.save()
          .then(result => { console.log('after save qblock: ', result);
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
  async addQuestions(items: any[], idBlock: number) {
    for (const item of items) { console.log('pre area' , item[this.HEADER.ac]);
      const body = {
        area: (await this.getArea(item[this.HEADER.ac])),
        description: item[this.HEADER.description],
        options: [],
        order: item[this.HEADER.order],
        qblocks: [idBlock],
        question_type: item[this.HEADER.type],
        reference: item[this.HEADER.reference]
      };

      console.log('Question Body before send:', body);

      await (new Question(body)).save()
        .then((question) => {
          this.addOptions(<Array<any>>item, question.id)
            .then(result => console.log('Options saved succesfully!!!', result))
            .catch(err => console.warn('options error:', err));
        })
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
  async addOptions(questionItem: any[], idQuestion: number) {
    const savePromises = [];
    const options = questionItem[this.OPTIONS];

    if (options.length === 0) {
      const body = {
        label: this.DEFAULT_LABEL,
        order: 1,
        points: questionItem[this.POINTS],
        question: idQuestion
      };

      await (new Option(body)).save()
        .then(result => result)
        .catch(err => this.logPromisesERROR.push({
          value: body,
          reason: err
        }));

      // savePromises.push(promise);
    } else {
      options.forEach(async (item, idx) => {
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

        console.log('option may be saved');
        // savePromises.push(promise);
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

  preview() {
    if (this.questionRef.submitForm()) {
      this.current++;
    }
  }

}


interface BlockType {
  name: string;
  questions: Question[];
}
