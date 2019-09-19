import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {QBlock, RowQuestion} from '../../../../../models';
import {Location} from '@angular/common';
import {QuestionsService} from '../../../../../services/questions/questions.service';

@Component({
  selector: 'app-station-details',
  templateUrl: './station-details.component.html',
  styleUrls: ['./station-details.component.less']
})
export class StationDetailsComponent implements OnInit {
  private editCache: { edit: boolean, new_item: boolean, item: QBlock, expand?: boolean }[] = [];
  private selectedQblock: {id: number, nQuestions: number} = {id: null, nQuestions: null};
  private drawerQUestionVisible: boolean = false;
  private questionToEdit: RowQuestion[] = [];
  private refreshQuestions: boolean = false;
  private defaultExpand: boolean = false;
  private isVisible: boolean = false;
  private totalItems: number = 0;
  private qblocks: QBlock[] = [];
  private perPage: number = 20;
  private id_station: number;
  private page: number = 1;
  private loading: boolean;
  private pagQblocks: any;
  private station: any;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private questionService: QuestionsService) { }

   ngOnInit() {
    this.id_station = parseInt(this.route.snapshot.paramMap.get('id'), 10);

    this.getQblocks(this.id_station);
  }

  importQblocksWithQuestions(items: any[], stationId: number) {
    this.questionService.importQblockWithQuestions(items, stationId)
      .then(() => this.getQblocks(stationId))
      .catch( err => console.log(err))
      .finally(() => this.loading = false);
  }

  onBack() {
    this.location.back();
  }

   getQblocks(stationId: number) {
     this.loading = true;

      QBlock.query({
        where: {station: stationId},
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
    this.qblocks.forEach( (item: QBlock)  => {
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
    this.getQblocks(this.id_station);
  }

  /**
   * Sets the editCache variable to true.
   * Changes text-view tags by input tags.
   *
   * @param item selected resource of stations list
   */
  startEdit(item: QBlock) {   console.log('StartEdit:qblock', item, this.editCache[item.id]);
    this.editCache[item.id].edit = true;
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayStations]{@link #updateArrayStations} function.
   *
   * @param qblock Resource selected
   */
  deleteItem(qblock: any) {
    qblock.destroy()
      .then(() => {
        this.getQblocks(this.id_station);
      });
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
    this.getQblocks(this.id_station);
  }

  onItemClicked(item: any) {
    item['clicked'] = (item['clicked'] !== true);
    item.expand = !item.expand;
    this.selectedQblock.id = item.id;
  }

  onNewQuestion(n_questions: number) {
    this.drawerQUestionVisible = true;
    this.selectedQblock.nQuestions = n_questions;
  }

  onEditQuestion($event) {
    this.questionToEdit = [];
    this.drawerQUestionVisible = true;
    this.questionToEdit.push($event);
  }

  sendRefreshQuestions() {
    this.refreshQuestions = true;
    setTimeout(() => this.refreshQuestions = false, 1000 );
  }

  onGetQuestions(questions: RowQuestion[]) {
    questions.forEach((question) => {
      if (question && question.id) {
        this.questionService.updateQuestion(question)
          .then(() => this.sendRefreshQuestions())
          .catch(err => console.error('ERROR: ', err))
          .finally(() => this.closeDrawer('question'));
      } else {
        this.questionService.addQuestions(questions, this.selectedQblock.id)
          .then(() => this.sendRefreshQuestions())
          .catch(err => console.error('ERROR: ', err))
          .finally( () => this.closeDrawer('question'));
      }
    });
  }
}

