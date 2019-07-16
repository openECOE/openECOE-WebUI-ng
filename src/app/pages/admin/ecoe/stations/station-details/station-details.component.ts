import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {QBlock, Station} from '../../../../../models';
import {getPotionID, Pagination} from '@openecoe/potion-client';

@Component({
  selector: 'app-station-details',
  templateUrl: './station-details.component.html',
  styleUrls: ['./station-details.component.less']
})
export class StationDetailsComponent implements OnInit {

  private id_station: string;
  private station: any;

  stations: Station[] = [];
  editCache: { edit: boolean, new_item: boolean, item: Station }[] = [];

  pagQblocks: any;
  pagStations: any;
  page: number = 1;
  totalItems: number = 0;
  perPage: number = 10;

  loading: boolean;


  constructor(private route: ActivatedRoute) { }

  ngOnInit() {

    this.id_station = this.route.snapshot.paramMap.get('id');



    console.log('id: ' + this.id_station);

    this.getQlobks()
      .then(value => console.log(value));
  }

  async getQlobks() {

    this.station = await Station.fetch<Station>(this.id_station);


    this.pagQblocks = await QBlock.query<QBlock, Pagination<QBlock>>({
      where: {station: this.station},
      sort: {order: false}
    }, {
      paginate: true, cache: false
    });

    console.log(this.pagQblocks);
  }
  /**
   * Fired when the current page is changed
   * @param pageNum number of the new page.
   */
  pageChange(pageNum: number) {
    this.loading = true;
    this.pagStations.page = pageNum;
    this.pagStations.changePageTo(pageNum)
      .then(retPage => this.loadPage(retPage))
      .finally(() => this.loading = false);
  }

  /**
   * When the stations are loaded, is fired for update
   * some variables.
   * @param pagination is a object type with all info about the current page.
   */
  loadPage(pagination: any) {
    this.pagStations = pagination;
    this.stations = [...this.pagStations.items];
    this.totalItems = this.pagStations.total;
    this.updateEditCache();

    this.stations.map(value => {
      // Fix for SelfReference Station Type
      if (value.parentStation !== null && !value.parentStation.name) {
        Station.fetch<Station>(getPotionID(value.parentStation['$uri'], '/station'))
          .then(parentStation => value.parentStation = parentStation);
      }
    });
  }

  /**
   * Updates editCache variable with the same values of the resources array and adds a 'edit' key.
   */
  updateEditCache(): void {
    this.stations.forEach((item) => {
      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        new_item: false,
        item: Object.create(item)
      };
    });
  }

  /**
   * Fired when the number of item per page is changed
   * @param pageSize new number of item per page.
   */
  pageSizeChange(pageSize: number) {
    this.perPage = pageSize;
    this.getQlobks().finally();
  }

  /**
   * Updates new results for parent select options
   * @param value string to search
   */
/*  searchInSelect(value: string, exclude?: string): void {
    if (value) {
      Station.query({
        where: {
          'ecoe': this.ecoeId,
          'name': {'$contains': value}
        },
        sort: {'order': false},
        page: 1,
        perPage: 50
      }, {paginate: true, cache: false})
        .then(response => {
          this.updateOptions(response, exclude);
        });
    } else {
      this.loadOptions4Select(exclude);
    }
  }*/


  /**
   * Sets the editCache variable to true.
   * Changes text-view tags by input tags.
   *
   * @param item selected resource of stations list
   */
  startEdit(item: Station, excludeItem?: string) {
    this.editCache[item.id].edit = true;
    /*this.loadOptions4Select(excludeItem);*/
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayStations]{@link #updateArrayStations} function.
   *
   * @param station Resource selected
   */
  deleteItem(station: Station) {
    station.destroy()
      .then(() => {
        this.getQlobks()
          .then(() => this.updateEditCache());
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

/*    const body = {
      name: cacheItem.name,
      ecoe: this.ecoeId,
      parentStation: (cacheItem.parentStation) ? cacheItem.parentStation.id : null
    };

    const request = cacheItem.update(body);

    request.then(response => {
      this.stations = this.stations.map(x => (x.id === cacheItem.id) ? response : x);
      this.editCache[cacheItem.id].edit = false;
    });*/
  }

  cancelEdit(item: any): void { // console.log('on:cancel:', item, this.editCache[item.id]); return;
    this.editCache[item.id].edit = false;
    this.editCache[item.id].item = Object.create(item);
  }

}
