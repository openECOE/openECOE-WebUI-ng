import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {QBlock, Question, RowQuestion, Station} from '../../../models';
import {Location} from '@angular/common';
import {QuestionsService} from '../../../services/questions/questions.service';
import {NzModalService} from 'ng-zorro-antd';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-station-details',
  templateUrl: './station-details.component.html',
  styleUrls: ['./station-details.component.less']
})
export class StationDetailsComponent implements OnInit {
  private editCache: { edit: boolean, new_item: boolean, item: QBlock, expand?: boolean }[] = [];
  private refreshQuestions: boolean = false;
  private defaultExpand: boolean = false;
  private pagQblocks: any;
  selectedQblock: {id: number, lastOrder: number} = {id: null, lastOrder: null};
  drawerQUestionVisible: boolean = false;
  questionToEdit: RowQuestion[] = [];
  isVisible: boolean = false;
  totalItems: number = 0;
  qblocks: QBlock[] = [];
  perPage: number = 20;
  id_station: number;
  page: number = 1;
  loading: boolean;
  station: any;

  private logPromisesERROR = [];
  private logPromisesOK = [];

  constructor(private route: ActivatedRoute,
              private location: Location,
              private questionService: QuestionsService,
              private modalService: NzModalService,
              private translate: TranslateService ) { }

   ngOnInit() {
    this.id_station = parseInt(this.route.snapshot.paramMap.get('id'), 10);
    Station.fetch(this.id_station).then(response => this.station = response);

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
  deleteItem(qblock: QBlock) {
    this.modalService.confirm({
      nzTitle: this.translate.instant('CONFIRM_ALSO_DELETE_QUESTIONS'),
      nzOnOk: () => {
        this.deleteQuestionsByQblock(qblock.id)
          .then(() => qblock.destroy()
              .then(() => this.getQblocks(this.id_station))
          );
      }},
      'confirm');
  }

  deleteQuestionsByQblock(qblockId: number) {
    const savePromises = [];
    this.logPromisesERROR = [];
    this.logPromisesOK = [];

    this.questionService.loadQuestions(qblockId, false)
      // @ts-ignore
      .then( (result: Question[]) => {
        console.log(result);
        for (const question of result) {
          const promise = this.questionService.deleteQuestion([question], question.id)
            .catch(err => {
              console.error(err);
              this.logPromisesERROR.push(err);
              return err;
            })
            .then((response) => {
              this.logPromisesOK.push(response);
              return response;
            });
          savePromises.push(promise);
        }
      })
      .catch((err) => {
        savePromises.push(err);
        this.logPromisesERROR.push(err);
      });
    return Promise.all(savePromises)
      .then(() =>
        new Promise((resolve, reject) =>
          this.logPromisesERROR.length > 0 ? reject(this.logPromisesERROR) : resolve(this.logPromisesOK)))
      .catch(err => new Promise(((resolve, reject) => reject(err))));
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

  onNewQuestion(order: number) {
    this.drawerQUestionVisible = true;
    this.selectedQblock.lastOrder = order;
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

  getQuestions(questions: RowQuestion[]) {
    if (questions[0] && questions[0].id) {
      this.questionService.updateQuestion(questions[0])
        .then(() => this.sendRefreshQuestions())
        .catch(err => console.error('ERROR: ', err))
        .finally(() => this.closeDrawer('question'));
    } else {
      this.questionService.addQuestions(questions, this.selectedQblock.id)
        .then(() => this.sendRefreshQuestions())
        .catch(err => console.error('ERROR: ', err))
        .finally(() => this.closeDrawer('question'));
    }
  }
}

