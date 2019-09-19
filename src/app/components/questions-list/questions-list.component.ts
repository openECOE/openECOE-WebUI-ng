import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Area, Option, QBlock, Question} from '../../models';
import {Pagination} from '@openecoe/potion-client';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.less']
})
export class QuestionsListComponent implements OnInit, OnChanges {

  @Input() qblock: QBlock = new QBlock();
  @Input() questionsList: Question[] = [];
  @Input() preview: boolean = false;
  @Input() refreshQuestions: boolean = false;

  @Output() newQuestion: EventEmitter<number> = new EventEmitter<number>();
  @Output() editQuestion: EventEmitter<any> = new EventEmitter<any>();

  private param_id: number;
  private questionsPage: Pagination<Question>;
  private editCache: Array<any> = [];
  private areas: Area[] = [];
  private pagAreas: Pagination<Area>;

  page: number = 1;
  perPage: number = 20;
  totalItems: number = 0;

  loading: boolean = false;
  defaultExpand: boolean = this.preview;

  questionTypeOptions: Array<{ type: string, label: string }> = [
    {type: 'RB', label: 'ONE_ANSWER'},
    {type: 'CH', label: 'MULTI_ANSWER'},
    {type: 'RS', label: 'VALUE_RANGE'}
  ];

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    if (this.questionsList.length > 0) {
      this.defaultExpand = this.preview;
      this.updateEditCache(this.preview);
    } else {
      if (this.route.snapshot.params.id) { this.param_id = +this.route.snapshot.params.id; }
      console.log(this.param_id);
      this.loadAreas().finally();
      this.loadQuestions(this.page, this.perPage);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.refreshQuestions && changes.refreshQuestions.currentValue) {
      this.loadQuestions(this.page, this.perPage);
    }
  }

  pageChange(page: number) {
    this.loadQuestions(page, this.perPage);
  }

  pageSizeChange(pageSize: number) {
    this.loadQuestions(this.page, pageSize);
  }

  loadQuestions(page: number, perPage: number) {
    this.loading = true;
    console.log('lets start loadQuestions: ', this.qblock.id);
    this.questionsList = [];
    Question.query<Question, Pagination<Question>>({
        where: {qblocks: {$contains: this.qblock.id ? this.qblock.id : this.param_id}},
        sort: {order: false},
        page: page,
        perPage: perPage
      },
      {
        paginate: true,
        cache: false
      }).then(pagQuestion => {
        this.questionsPage = pagQuestion;
        this.totalItems = pagQuestion.total;
        this.questionsList = this.questionsPage != null ? [...this.questionsPage['items']] : [];
        this.updateEditCache();
        this.loading = false;
      }
    );
  }

  /**
   * Updates editCache variable with the same values of the resources array and adds a 'edit' key.
   */
  updateEditCache(preview?: boolean): void {
    this.editCache = [];

    this.questionsList.forEach(item => {
      if (preview) {
        item.id = item.order;
      }
      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        new_item: false,
        item: Object.create(item),
        expand: this.defaultExpand
      };
    });
  }

  async loadAreas() {
    this.pagAreas = await Area.query<Area, Pagination<Area>>({sort: {code: false}}, {paginate: true});
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
   * @param id Id of the selected resource
   */
  startEdit(id: number) {
    const idx = this.questionsList.map(item => item.id).indexOf(id);
    this.editQuestion.next(this.questionsList[idx]);
  }

  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   *
   * @param editItem Resource selected
   */
  saveItem(editItem: any) {
    const question = editItem.item;

    if (!question.description || !question.reference || !question.questionType || !question.area) {
      return;
    }

    question.question_type = question.questionType;

    question.save()
      .then(response => {
        this.questionsList[question.id] = response;
        this.editCache[question.id].edit = false;
      })
      .catch(err => console.error(err));
  }

  /**
   * Sets the editCache variable to false.
   * If resource is not already saved, calls [updateArrayQuestions]{@link #updateArrayQuestions} function.
   * Else resets editCache to the previous value.
   *
   * @param id Resource selected
   */
  cancelEdit(id: number) {
    this.editCache[id].edit = false;

    if (this.editCache[id].new_item) {
      this.updateArrayQuestions(id);
    } else {
      this.editCache[id].data = Object.assign(new Question(), this.questionsList[id]);
    }
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayQuestions]{@link #updateArrayQuestions} function.
   *
   * @param id Resource selected
   */
  async deleteItem(id: number) {

    const idx = this.questionsList.map(item => item.id).indexOf(id);
    console.log('deleteItem:', id, idx, this.questionsList[idx]);

    const options: Option[] = (this.questionsList[idx].options) ? this.questionsList[idx].options : [];

    if (options.length > 0) {
      for (const option of options) {
        await option.destroy();
      }
    }
    console.log('after delete all options go delete QUESTION');
    this.questionsList[idx].destroy().then(() => {
      this.updateArrayQuestions(id);
      this.loadQuestions(this.page, this.perPage);
    });
  }

  /**
   * Deletes the editCache key assigned to the resource id passed and filters out the item from the resources array.
   *
   * @param idx Id of the resource passed
   */
  updateArrayQuestions(idx: number) {
    delete this.editCache[idx];
    this.questionsList = this.questionsList.filter(x => x !== this.questionsList[idx]);

  }

  /**
   * Adds a new empty field to the resources array.
   * Then updates editCache with the new resource.
   */
  addQuestion() {
    this.newQuestion.emit(this.questionsList.length);
  }

  getQuestionTypeLabel(questionType: string) {
    return this.questionTypeOptions.find(x => x.type === questionType).label;
  }

}
