import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Option, Block, Question, Answer} from '../../models';
import {Pagination} from '@openecoe/potion-client';
import {ActivatedRoute} from '@angular/router';
import {QuestionsService} from '@services/questions/questions.service';
import { TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-questions-list',
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.less']
})
export class QuestionsListComponent implements OnInit, OnChanges {

  @Input() qblock: Block = new Block();
  @Input() questionsList: Question[] = [];
  @Input() preview: boolean = false;
  @Input() refreshQuestions: boolean = false;
  @Input() answers: Option[] = [];
  @Input() connectedList: string[] = [];

  @Output() newQuestion: EventEmitter<{order: number, block: Block}> = new EventEmitter<{order: number, block: Block}>();
  @Output() editQuestion: EventEmitter<Question> = new EventEmitter<Question>();
  @Output() answerQuestion: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDrop: EventEmitter<any> = new EventEmitter<any>();

  questionsPage: Pagination<Question>;
  editCache: Array<any> = [];

  page: number = 1;
  perPage: number = 10;
  totalItems: number = 0;

  loading: boolean = false;
  defaultExpand: boolean = false;

  questionTypeOptions: Array<{ type: string, label: string }> = [
    {type: 'radio', label: 'ONE_ANSWER'},
    {type: 'checkbox', label: 'MULTI_ANSWER'},
    {type: 'range', label: 'VALUE_RANGE'}
  ];

  constructor(private route: ActivatedRoute,
              private questionService: QuestionsService,
              private translate: TranslateService,
              private modalService: NzModalService
            ) {
  }

  ngOnInit() {
    if (this.questionsList.length > 0) {
      if (this.preview) {
        this.defaultExpand = true;
      }
      this.updateEditCache(this.preview);
    } else {
      this.loadQuestions(this.qblock.id, this.page, this.perPage);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.refreshQuestions && changes.refreshQuestions.currentValue) {
      this.loadQuestions(this.qblock.id, this.page, this.perPage);
    }
  }

  pageChange(page: number) {
    this.loadQuestions(this.qblock.id, page, this.perPage);
  }

  pageSizeChange(pageSize: number) {
    this.loadQuestions(this.qblock.id, this.page, pageSize);
  }

  loadQuestions(idBlock: number, page: number, perPage: number) {
    this.loading = true;
    this.questionsList = [];

    this.questionService.loadQuestions(idBlock, true, page, perPage)
      .then(pagQuestion => {
          this.questionsPage = pagQuestion;
          this.totalItems = pagQuestion.total;
          this.questionsList = this.questionsPage != null ? [...this.questionsPage['items']] : [];
          this.updateEditCache();
          this.loading = false;
      });
  }

  /**
   * Updates editCache variable with the same values of the resources array and adds a 'edit' key.
   */
  updateEditCache(preview?: boolean): void {
    this.editCache = [];

    this.questionsList.forEach(item => {
      const cache_id = preview ? item.order : item.id;

      this.editCache[cache_id] = {
        edit: this.editCache[cache_id] ? this.editCache[cache_id].edit : false,
        new_item: false,
        item: Object.create(item),
        expand: this.defaultExpand
      };
    });
  }

  /**
   * Sets the editCache variable to true.
   * Changes text-view tags by input tags.
   *
   * @param question item selected resource
   */
  onEditQuestion(question: Question) {
    this.editQuestion.next(question);
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayQuestions]{@link #updateArrayQuestions} function.
   *
   * @param question to remove
   */
  async deleteQuestion(question: Question) {
    const id = question.id;
    const answers = await Answer.query({where: {question}}) as Answer[];

    if(!answers.length) {
      this. questionService.deleteQuestion(question)
      .then(() => {
        this.updateArrayQuestions(id);
        this.loadQuestions(this.qblock.id, this.page, this.perPage);
      });
    } else {
      this.modalService.confirm({
        nzTitle: this.translate.instant("CONFIRM_DELETE_ANSWERS"),
        nzOnOk: () => {
          this. questionService.deleteQuestion(question)
          .then(() => {
            this.updateArrayQuestions(id);
            this.loadQuestions(this.qblock.id, this.page, this.perPage);
          });
        }
      },
      'confirm');
    }
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
    const pos = this.questionsList.length > 0 ? this.questionsList.length - 1 : 0;
    const order = this.questionsList[pos] ? this.questionsList[pos].order : 0;
    this.newQuestion.emit({order, block: this.qblock});
  }

  getQuestionTypeLabel(questionType: string) {
    return this.questionTypeOptions.find(x => x.type === questionType).label;
  }

  onOptionChanged($event: any) {
    this.answerQuestion.emit($event);
  }

  async getNewOrder(event: CdkDragDrop<string[]>): Promise<Number> {
    const blocks = await Block.query({
      where: { station: this.qblock.station },
      sort: { order: false },
    }) as Block[];

    let totalQuestions = 0;

    for(const block of blocks) {
      const questions = await Question.query({
        where: { block: block },
        sort: { order: false },
      }) as Question[];
      
      if(block.id === Number(event.container.id)) {
        if(block.id === blocks[0].id) {
          return event.currentIndex + 1;
        }
        if(!(questions.length)) {
          if(Number(event.container.id) > Number(event.previousContainer.id)) {
            return totalQuestions;
          }
          return totalQuestions + 1;
        }

        if(event.currentIndex == questions.length) {
          return totalQuestions + event.currentIndex;
        }

        return totalQuestions + event.currentIndex + 1;
      }

      totalQuestions += questions.length;
    }
  }

  dropItemInPreview(previousIndex: number, currentIndex: number): void {
    moveItemInArray(this.questionsList, previousIndex, currentIndex);
    this.questionsList.forEach((item,index) => { item.order = index + 1});
  }

  async dropItem(event: CdkDragDrop<string[]>) {
    const newBlock = await Block.fetch<Block>(event.container.id.toString());
    const newOrder = await this.getNewOrder(event);
    if (newOrder !== event.item.data.order || newBlock !== event.item.data.block) {
      try {
        await event.item.data.update({ order: newOrder, block: newBlock });
      } catch(e) {
        console.log(e);
      }
      this.onDrop.emit();  
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if(this.preview) {
      this.dropItemInPreview(event.previousIndex, event.currentIndex);
    } else {
      this.dropItem(event);
    }
  }

  onDragStart() {
    this.editCache.forEach((item) => item.expand = false);
  }

}
