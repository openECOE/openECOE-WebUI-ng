import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Block, Question, RowQuestion, Station} from '../../../models';
import {Location} from '@angular/common';
import {QuestionsService} from '@services/questions/questions.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import {TranslateService} from '@ngx-translate/core';
import { ParserFile } from '@app/components/upload-and-parse/upload-and-parse.component';
import { CdkDragDrop} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-station-details',
  templateUrl: './station-details.component.html',
  styleUrls: ['./station-details.component.less']
})
export class StationDetailsComponent implements OnInit {
  editCache: { edit: boolean, new_item: boolean, item: Block, expand?: boolean }[] = [];
  refreshQuestions: boolean = false;
  defaultExpand: boolean = false;
  pagQblocks: any;
  selectedQblock: {block: Block, lastOrder: number} = {block: null, lastOrder: null};
  drawerQUestionVisible: boolean = false;
  questionToEdit: Question[] = [];
  isVisible: boolean = false;
  totalItems: number = 0;
  qblocks: Block[] = [];
  perPage: number = 20;
  id_station: number;
  page: number = 1;
  loading: boolean;
  station: any;
  ecoe_name: String;
  ecoeId: number;

  private logPromisesERROR = [];
  private logPromisesOK = [];

  questionsParser: ParserFile = {
    "filename": "questions.csv",
    "fields": ["order", "description", "reference", "points", "area", "questionType", "range", "option1", "points1", "option2", "points2", "option3", "points3", "option4", "points4", "option5", "points5", "option6", "points6", "option7", "points7", "option8", "points8", "option9", "points9", "option10", "points10"],
    "data": [
      ["", "example 1st block name or description"],
      ["1", "question description 1", "reference name 1", "1", "1", "simple"],
      ["2", "question description 2", "reference name 2", "3", "1", "simple"],
      ["3", "question description 3", "reference name 3", "4", "1", "simple"],
      ["", "example 2nd block name or description"],
      ["4", "question description 4", "reference name 4", "4", "1", "simple"],
      ["5", "question description 5", "reference name 5", "3", "1", "simple"],
      ["6", "question description 6", "reference name 6", "3", "1", "simple"],
      ["7", "question description 7", "reference name 7", "5", "1", "multiple","","Si","5","No","-10"],
      ["8", "question description 8", "reference name 8", "-10", "1", "simple","","No hace exploración","-10"],
      ["9", "question description 9", "reference name 9", "6", "1", "rango", "5"],
      ["10", "question description 10", "reference name 10", "6", "1", "rango"],
    ]
  };

  constructor(private route: ActivatedRoute,
              private location: Location,
              private questionService: QuestionsService,
              private modalService: NzModalService,
              private translate: TranslateService,
              private router: Router ) { }

   ngOnInit() {
    this.route.params.subscribe(params => {
      this.id_station = +params.stationId;
      Station.fetch(this.id_station).then(response => {
        this.station = response;
        this.ecoe_name = response.ecoe.name;
        this.ecoeId = response.ecoe.id;
        this.questionsParser.filename = this.ecoe_name + '_' + this.station.name + '_questions.csv';

        this.getQblocks(this.station);
      });
    });
  }

  importQblocksWithQuestions(items: any[], station: Station) {
    items = this.convertQuestionTypes(items);

    this.questionService.importQblockWithQuestions(items, station)
      .then(() => this.getQblocks(station))
      .catch( err => console.log(err))
      .finally(() => this.loading = false);
  }

  convertQuestionTypes(items: any[]): any[] {
    const spanishToEnglishQuestionType = {
      'simple': 'checkbox',
      'multiple': 'radio',
      'rango': 'range'
    };

    return items.map(item => {
      const spanishQuestionType = item['questionType'];
      const englishQuestionType = spanishToEnglishQuestionType[spanishQuestionType];
      if (englishQuestionType) {
        item['questionType'] = englishQuestionType;
      }
      return item;
    });
  }
  
  onBack() {
    this.router.navigate(['/ecoe/' + this.ecoeId + '/admin/stations']).finally();
  }

   getQblocks(station: Station) {
     this.loading = true;

      Block.query({
        where: {station: station},
        sort: {order: false},
        page: this.page,
        perPage: this.perPage
      }, {
        paginate: true, cache: false
      })
        .then((response: any) => this.loadPage(response))
        .finally(() => this.loading = false);
    }
  /**
   * Fired when the current page is changed
   * @param pageNum number of the new page.
   */
  pageChange(pageNum: number) {
    this.loading = true;
    this.pagQblocks.page = pageNum;
    this.pagQblocks.changePageTo(pageNum)
      .then(retPage => this.loadPage(retPage))
      .finally(() => this.loading = false);
  }

  /**
   * When the stations are loaded, is fired for update
   * some variables.
   * @param pagination is a object type with all info about the current page.
   */
  loadPage(pagination: any) {
    this.pagQblocks = pagination;
    this.qblocks = [...this.pagQblocks.items];
    this.totalItems = this.pagQblocks.total;
    this.updateEditCache();
  }

  /**
   * Updates editCache variable with the same values of the resources array and adds a 'edit' key.
   */
  updateEditCache(): void {
    this.editCache = [];
    this.qblocks.forEach( (item: Block)  => {
      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        new_item: false,
        item: Object.create(item),  // (Object.create(item)) as QBlock,
        expand: this.defaultExpand
      };
    });
  }

  /**
   * Fired when the number of item per page is changed
   * @param pageSize new number of item per page.
   */
  pageSizeChange(pageSize: number) {
    this.perPage = pageSize;
    this.getQblocks(this.station);
  }

  /**
   * Sets the editCache variable to true.
   * Changes text-view tags by input tags.
   *
   * @param item selected resource of stations list
   */
  startEdit(item: Block) {   console.log('StartEdit:qblock', item, this.editCache[item.id]);
    this.editCache[item.id].edit = true;
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayStations]{@link #updateArrayStations} function.
   *
   * @param qblock Resource selected
   */
  deleteItem(qblock: Block) {
    this.modalService.confirm({
      nzTitle: this.translate.instant('CONFIRM_ALSO_DELETE_QUESTIONS'),
      nzOnOk: () => {
        this.qblocks = this.qblocks.filter(block => block.id !== qblock.id);
        qblock.destroy()
          .then(() => this.refreshTable());
      }},
      'confirm');
  }


  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   * If the station is created, adds a Qblock by default
   *
   * @param cacheItem Resource selected
   */
  updateItem(cacheItem: any): void {
    if (!cacheItem.name) {
      return;
    }

    const body = {
      name: cacheItem.name,
      order: cacheItem.order,
    };

    const request = cacheItem.update(body);

    request.then(response => {
      this.qblocks = this.qblocks.map(x => (x.id === cacheItem.id) ? response : x);
      this.editCache[cacheItem.id].edit = false;
      this.getQblocks(this.station);
    });
    request.catch( err => console.error(err));
  }

  cancelEdit(item: any): void {
    this.editCache[item.id].edit = false;
    this.editCache[item.id].item = Object.create(item);
  }

  /**
   * Opens form window to add new qblock/s
   */
  showDrawer() {
    this.isVisible = true;
  }

  /**
   * Closes the form qblock window
   */
  closeDrawer(type?: string) {
    if (type) {
      this.drawerQUestionVisible = false;
      this.questionToEdit = [];
      return;
    }
    this.isVisible = false;
    this.questionToEdit = [];
    this.getQblocks(this.station);
  }

  onItemClicked(item: any) {
    item['clicked'] = (item['clicked'] !== true);
    item.expand = !item.expand;
    //this.selectedQblock.block = item;
  }

  onNewQuestion(event: {order: number, block: Block}) {
    this.drawerQUestionVisible = true;
    this.selectedQblock.block = event.block
    this.selectedQblock.lastOrder = event.order;
  }

  onEditQuestion($event) {
    this.questionToEdit = [];
    this.drawerQUestionVisible = true;

    this.questionToEdit.push($event);
  }

  refreshTable(): void {
    this.getQblocks(this.station);
    this.sendRefreshQuestions();
  }
  
  sendRefreshQuestions() {
    this.refreshQuestions = true;
    setTimeout(() => this.refreshQuestions = false, 1000 );
  }

  getQuestions(questions: RowQuestion[]) {
    if (questions[0] && questions[0].id) {
      this.questionService.updateQuestion(questions[0])
        .then(() => this.sendRefreshQuestions())
        .catch(err => console.error('ERROR: ', err))
        .finally(() => this.closeDrawer('question'));
    } else {
      this.questionService.addQuestions(questions, this.selectedQblock.block)
        .then(() => this.sendRefreshQuestions())
        .catch(err => console.error('ERROR: ', err))
        .finally(() => this.closeDrawer('question'));
    }
  }

  onDragStart(items: any) {
    items.forEach((item) => item.expand = false);
  }
  
  onDropBlock(event: CdkDragDrop<string[]>) {
    this.qblocks[event.previousIndex].update({order: event.currentIndex + 1})
    .then(() => {
      this.refreshTable();
    });
  }

  onDropQuestion() {
    this.sendRefreshQuestions();
  }

  getConnectedList(): string[] {
    return this.qblocks.map(x => `${x.id}`);
  }
}

