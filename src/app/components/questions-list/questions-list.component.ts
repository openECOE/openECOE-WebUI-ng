import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Option, QBlock, Question} from '../../models';
import {Pagination} from '@openecoe/potion-client';
import {ActivatedRoute} from '@angular/router';
import {QuestionsService} from '../../services/questions/questions.service';

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
  @Input() answers: Option[] = [];

  @Output() newQuestion: EventEmitter<number> = new EventEmitter<number>();
  @Output() editQuestion: EventEmitter<any> = new EventEmitter<any>();
  @Output() answerQuestion: EventEmitter<any> = new EventEmitter<any>();

  questionsPage: Pagination<Question>;
  editCache: Array<any> = [];

  page: number = 1;
  perPage: number = 10;
  totalItems: number = 0;

  loading: boolean = false;
  defaultExpand: boolean = false;

  questionTypeOptions: Array<{ type: string, label: string }> = [
    {type: 'RB', label: 'ONE_ANSWER'},
    {type: 'CH', label: 'MULTI_ANSWER'},
    {type: 'RS', label: 'VALUE_RANGE'}
  ];

  constructor(private route: ActivatedRoute,
              private questionService: QuestionsService) {
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

  /**
   * Sets the editCache variable to true.
   * Changes text-view tags by input tags.
   *
   * @param id Id of the selected resource
   */
  onEditQuestion(id: number) {
    const idx = this.questionsList.map(item => item.id).indexOf(id);
    this.editQuestion.next(this.questionsList[idx]);
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayQuestions]{@link #updateArrayQuestions} function.
   *
   * @param questions array where search the id question
   * @param id Resource selected
   */
  deleteQuestion(questions: Question[], id: number) {
    this.questionService.deleteQuestion(questions, id)
      .then(() => {
        this.updateArrayQuestions(id);
        this.loadQuestions(this.qblock.id, this.page, this.perPage);
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
    const pos = this.questionsList.length > 0 ? this.questionsList.length - 1 : 0;
    const order = this.questionsList[pos] ? this.questionsList[pos].order : 0;
    console.log(pos, order);
    this.newQuestion.emit(order);
  }

  getQuestionTypeLabel(questionType: string) {
    return this.questionTypeOptions.find(x => x.type === questionType).label;
  }

  onOptionChanged($event: any) {
    this.answerQuestion.emit($event);
  }

  drop(event: CdkDragDrop<string[]>): void {
    // this.reOrder(event.previousIndex, event.currentIndex);
    moveItemInArray(this.questionsList, event.previousIndex, event.currentIndex);
    this.questionsList.forEach((item, index) => {
      const _newOrder = index + 1 + ((this.page - 1) * this.perPage);
      const _oldOrder = item.order;
      if (_newOrder !== _oldOrder ) {
        item.order = _newOrder;
        item.save();
      }
    });
  }

  reOrder(prevIdx: number, currIdx: number) {
    this.questionsList.forEach((item, index) => {
      this.questionsList[index].order = index > currIdx ? item.order + 1 : item.order - 1;
    });
    this.questionsList[prevIdx].order = currIdx + 1;
    this.questionsList.sort((a, b) => a.order > b.order ? 1 : -1);
  }

}
