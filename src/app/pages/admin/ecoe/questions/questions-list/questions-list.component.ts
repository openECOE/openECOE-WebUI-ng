import {Component, Input, OnInit} from '@angular/core';
import {Area, QBlock, Question} from '../../../../../models';
import {Pagination} from '@openecoe/potion-client';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.less']
})
export class QuestionsListComponent implements OnInit {

  // @Input() idEcoe: ECOE;
  @Input() qblock: QBlock = new QBlock();

  param_id: number;


  questionsPage: Pagination<Question>;
  questionsList: Question[] = [];

  editCache: Array<any> = [];

  areas: Area[] = [];
  pagAreas: Pagination<Area>;

  page: number = 1;
  perPage: number = 20;
  totalItems: number = 0;

  loading: boolean = false;
  defaultExpand: boolean = false;

  questionTypeOptions: Array<{ type: string, label: string }> = [
    {type: 'RB', label: 'ONE_ANSWER'},
    {type: 'CH', label: 'MULTI_ANSWER'},
    {type: 'RS', label: 'VALUE_RANGE'}
  ];

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    if (this.route.snapshot.params.id) { console.log(+this.route.snapshot.params.id);
      this.param_id = +this.route.snapshot.params.id;
    }

    this.loadAreas();
    this.loadQuestions(this.page, this.perPage);
  }

  pageChange(page: number) {
    this.loadQuestions(page, this.perPage);
  }

  pageSizeChange(pageSize: number) {
    this.loadQuestions(this.page, pageSize);
  }

  loadQuestions(page: number, perPage: number) {
    this.loading = true;

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
  updateEditCache(): void {
    this.editCache = [];

    this.questionsList.forEach(item => {

      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        new_item: false,
        item: Object.create(item),
        expand: this.defaultExpand
      };
    });
  }

  async loadAreas() {
    // this.pagAreas = await Area.query<Area, Pagination<Area>>({where: {ecoe: this.idEcoe}, sort: {code: false}}, {paginate: true});
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
   * @param idx Id of the selected resource
   */
  startEdit(id: number) {
    this.editCache[id].edit = true;
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
   * @param idx Resource selected
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
   * @param idx Resource selected
   */
  deleteItem(id: number) {
    this.questionsList[id].destroy().then(() => this.updateArrayQuestions(id));
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
  async addQuestion() { console.log('new id: ', this.questionsList[this.questionsList.length - 1].id + 1);
    const newItem = {
      // id: this.questionsList[this.questionsList.length - 1].id + 1,
      // id: 100,
      order: this.questionsList.length + 1,
      description: '',
      reference: '',
      questionType: '',
      area: null,
      qblocks: [this.qblock],
      options: []
    };

    // Recover last item to make index
    const lastId: number = (await Question.first<Question>({sort: {'$uri': true}})).id;

    // console.log(new Question(newItem));
    // return;
     const question = new Question(newItem);
    // const question = newItem as Question;

    console.log('before questionList: ', Object.create(this.questionsList));

    this.questionsList = [...this.questionsList, question];

    console.log('after questionList: ', this.questionsList);

    console.log('antes de error', this.questionsList[this.questionsList.length - 2]);
    // console.log(question, this.questionsList, this.questionsList.indexOf(question) );

    // this.editCache[this.questionsList.indexOf(question)] = {
    this.editCache[this.questionsList[this.questionsList.length - 2].id + 1] = {
      edit: true,
      new_item: true,
      item: Object.assign(new Question(), question),
      expand: this.defaultExpand
    };

    console.log('despues de error', this.editCache);
  }

  getQuestionTypeLabel(questionType: string) {
    // TODO: CHECK FOR REDUCE NUMBER OF CALLS THIS METHOD
    return this.questionTypeOptions.find(x => x.type === questionType).label;
  }

}
