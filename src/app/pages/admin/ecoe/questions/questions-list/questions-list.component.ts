import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Area, ECOE, QBlock, Question, Round} from '../../../../../models';
import {Pagination} from '@openecoe/potion-client';
import {from} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.less']
})
export class QuestionsListComponent implements OnInit {

  @Input() ecoe: ECOE;
  @Input() qblock: QBlock;

  // @Output() questionsChange = new EventEmitter();
  //
  // @Input()
  // get questions() {
  //   return this.questionsList;
  // }
  //
  // set questions(questions: Question[]) {
  //   this.questionsList = questions;
  //   this.questionsChange.emit(this.questionsList);
  // }

  questionsPage: Pagination<Question>;
  questionsList: Question[] = [];

  editCache: Array<any> = [];

  areas: Area[] = [];
  pagAreas: Pagination<Area>;

  page: number = 1;
  perPage: number = 20;
  totalItems: number = 0;

  loading: boolean = false;

  questionTypeOptions: Array<{ type: string, label: string }> = [
    {type: 'RB', label: 'ONE_ANSWER'},
    {type: 'CH', label: 'MULTI_ANSWER'},
    {type: 'RS', label: 'VALUE_RANGE'}
  ];

  constructor() {
  }

  ngOnInit() {
    this.loading = true;
    this.loadQuestions()
      .finally(() => this.loading = false);
  }

  pageChange($event) {

  }

  pageSizeChange($event) {

  }

  async loadQuestions() {
    this.questionsPage = await this.qblock.getQuestions({
        sort: {order: false}
      },
      {
        paginate: true,
        cache: false
      });

    this.questionsList = this.questionsPage != null ? [...this.questionsPage['items']] : [];

    this.updateEditCache();
    await this.loadAreas();

  }


  /**
   * Updates editCache variable with the same values of the resources array and adds a 'edit' key.
   */
  updateEditCache(): void {
    this.editCache = [];

    this.questionsList.forEach(item => {
      const index = this.questionsList.indexOf(item);

      this.editCache[index] = {
        edit: this.editCache[index] ? this.editCache[index].edit : false,
        data: Object.assign(new Question(), item)
      };
    });
  }

  async loadAreas() {
    this.pagAreas = await Area.query<Area, Pagination<Area>>({where: {ecoe: ECOE}}, {paginate: true});
    this.areas = [...this.pagAreas['items']];
  }

  async loadMoreAreas() {
    const nextPage = this.pagAreas.page + 1;

    if (nextPage <= this.pagAreas.pages) {
      this.areas = [...this.areas, ...(await this.pagAreas.changePageTo(nextPage)).items];
    }
  }

  /**
   * Sets the editCache variable to true.
   * Changes text-view tags by input tags.
   *
   * @param idx Id of the selected resource
   */
  startEdit(idx: number) {
    this.editCache[idx].edit = true;
  }

  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   *
   * @param editItem Resource selected
   */
  saveItem(editItem: any) {
    const index = this.editCache.indexOf(editItem);
    const question = editItem.data;

    if (!question.description || !question.reference || !question.questionType || !question.area) {
      return;
    }

    question.save().then(response => {
      // this.cancelEdit(index);

      this.questionsList[index] = response;
      this.editCache[index].edit = false;
    });
  }

  /**
   * Sets the editCache variable to false.
   * If resource is not already saved, calls [updateArrayQuestions]{@link #updateArrayQuestions} function.
   * Else resets editCache to the previous value.
   *
   * @param idx Resource selected
   */
  cancelEdit(idx: number) {
    this.editCache[idx].edit = false;

    if (this.editCache[idx].new_item) {
      this.updateArrayQuestions(idx);
    } else {
      this.editCache[idx].data = Object.assign(new Question(), this.questionsList[idx]);
    }
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayQuestions]{@link #updateArrayQuestions} function.
   *
   * @param idx Resource selected
   */
  deleteItem(idx: number) {
    this.questionsList[idx].destroy().then(() => this.updateArrayQuestions(idx));
  }

  /**
   * Deletes the editCache key assigned to the resource id passed and filters out the item from the resources array.
   *
   * @param idx Id of the resource passed
   */
  updateArrayQuestions(idx: number) {
    delete this.editCache[idx];
    // delete this.questionShowQblocks[idx];
    this.questionsList = this.questionsList.filter(x => x !== this.questionsList[idx]);

  }

  /**
   * Adds a new empty field to the resources array.
   * Then updates editCache with the new resource.
   */
  async addQuestion() {
    const newItem = {
      order: this.questionsList.length + 1,
      description: '',
      reference: '',
      question_type: '',
      area: '',
      qblocks: [this.qblock],
      options: []
    };

    // Recover last item to make index
    const lastId: number = (await Question.first<Question>({sort: {'$uri': true}})).id;

    const question = new Question(newItem);

    this.questionsList = [...this.questionsList, question];

    this.editCache[this.questionsList.indexOf(question)] = {
      edit: true,
      new_item: true,
      data: Object.assign(new Question(), question)
    };
  }

  getQuestionTypeLabel(questionType: string) {
    return this.questionTypeOptions.find(x => x.type === questionType).label;
  }

}
