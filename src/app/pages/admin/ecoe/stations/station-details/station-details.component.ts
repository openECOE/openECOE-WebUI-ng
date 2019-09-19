import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {QBlock, RowQuestion, Station} from '../../../../../models';
import {Location} from '@angular/common';
import {QblockQuestionFormComponent} from '../../../../../components/qblock-question-form/qblock-question-form.component';

@Component({
  selector: 'app-station-details',
  templateUrl: './station-details.component.html',
  styleUrls: ['./station-details.component.less']
})
export class StationDetailsComponent implements OnInit {

  private refreshQuestions: boolean = false;
  private id_station: number;
  private station: any;
  private selectedQblock: {id: number, nQuestions: number} = {id: null, nQuestions: null};
  private drawerQUestionVisible: boolean = false;

  private questionToEdit: RowQuestion[] = [];

  stations: Station[] = [];
  editCache: { edit: boolean, new_item: boolean, item: QBlock, expand?: boolean }[] = [];

  pagQblocks: any;
  page: number = 1;
  totalItems: number = 0;
  perPage: number = 20;

  loading: boolean;
  defaultExpand: boolean = false;

  qblocks: QBlock[] = [];

  isVisible: boolean = false;

  constructor(private route: ActivatedRoute,
              private location: Location) { }

   ngOnInit() {

    this.id_station = parseInt(this.route.snapshot.paramMap.get('id'), 10);
    Station.first({where: {$uri: `/api/v1/stations/${this.id_station}`}})
      .then(response => this.station = response);

    this.getQblocks();
  }

  onBack() {
    this.location.back();
  }

   getQblocks() { console.log('getQblocks');
     this.loading = true;

      QBlock.query({
        where: {station: this.id_station},
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
    this.getQblocks();
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
        this.getQblocks();
      });
  }

  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   * If the station is created, adds a Qblock by default
   *
   * @param cacheItem Resource selected
   */
  updateItem(cacheItem: any): void { console.log('updateItem()', cacheItem);
    if (!cacheItem.name) {
      return;
    }

    const body = {
      name: cacheItem.name,
      order: cacheItem.order,
      // station: cacheItem.station
    };

    const request = cacheItem.update(body);

    request.then(response => {
      this.qblocks = this.qblocks.map(x => (x.id === cacheItem.id) ? response : x);
      this.editCache[cacheItem.id].edit = false;
    });
    request.catch( err => console.error(err));
  }

  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   * If the station is created, adds a Qblock by default
   *
   * @param cacheItem Resource selected
   */
/*  updateItem(cacheItem: any): void { console.log('updateItem()', cacheItem);
    if (!cacheItem.name) {
      return;
    }

    const body = {
      name: cacheItem.name,
      ecoe: this.ecoeId,
      parentStation: (cacheItem.parentStation) ? cacheItem.parentStation.id : null
    };

    const request = cacheItem.update(body);

    request.then(response => {
      this.stations = this.stations.map(x => (x.id === cacheItem.id) ? response : x);
      this.editCache[cacheItem.id].edit = false;
    });
  }*/

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
   * Removes the Qblock filter and reloads the page by updating the URL.
   *
   * @param station Id of the station passed
   */
/*  deleteFilter(station: number) {
    console.log('deleteFilter:', station);
    /!*this.router.navigate(['../questions'], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {station: station}
    }).finally();*!/
  }*/

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
    this.getQblocks();
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
    const _qblockQuestionFormComponent = new QblockQuestionFormComponent();

    questions.forEach((question) => {
      if (question && question.id) {
        _qblockQuestionFormComponent.updateQuestion(question)
          .then(() => this.sendRefreshQuestions())
          .catch(err => console.error('ERROR: ', err))
          .finally(() => this.closeDrawer('question'));
      } else {
        _qblockQuestionFormComponent.addQuestions(questions, this.selectedQblock.id)
          .then(() => this.sendRefreshQuestions())
          .catch(err => console.error('ERROR: ', err))
          .finally( () => this.closeDrawer('question'));
      }
    });
  }
}

