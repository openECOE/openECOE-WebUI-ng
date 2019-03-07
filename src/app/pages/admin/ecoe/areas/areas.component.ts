import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../../../services/api/api.service';
import {SharedService} from '../../../../services/shared/shared.service';

/**
 * Component with areas and questions by area.
 */
@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.less']
})
export class AreasComponent implements OnInit {

  areas: any[] = [];
  ecoeId: number;
  editCache = {};
  index: number = 1;

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private sharedService: SharedService) {
  }

  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;
    this.loadAreas();
  }

  /**
   * Load areas by the passed ECOE.
   * Then calls [updateEditCache]{@link #updateEditCache} function.
   */
  loadAreas() {
    this.apiService.getResources('area', {
      where: `{"ecoe":${this.ecoeId}}`
    }).subscribe(response => {
      this.editCache = {};
      this.areas = response;
      this.updateEditCache();
    });
  }

  /**
   * Adds to the resource passed its array of questions as a new key object.
   * Then calls [updateEditCache]{@link #updateEditCache} function.
   *
   * @param {boolean} expandOpen State of the expanded sub-table
   * @param {any} area Resource selected to show its questions
   */
  loadQuestionsByArea(expandOpen: boolean, area: any) {
    if (expandOpen) {
      this.apiService.getResources('question', {
        where: `{"area":${area.id}}`,
        sort: '{"order":false}'
      }).subscribe(questions => {
        area.questionsArray = questions;
        this.updateEditCache();
      });
    }
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayAreas]{@link #updateArrayAreas} function.
   *
   * @param {any} area Resource selected
   */
  deleteItem(area: any) {
    this.apiService.deleteResource(area['$uri']).subscribe(() => {
      this.updateArrayAreas(area.id);
    });
  }

  /**
   * Sets the editCache variable to true.
   * Changes text-view tags by input tags.
   *
   * @param {number} id Id of the selected resource
   */
  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  /**
   * Sets the editCache variable to false.
   * If resource is not already saved, calls [updateArrayAreas]{@link #updateArrayAreas} function.
   * Else resets editCache to the previous value.
   *
   * @param {any} area Resource selected
   */
  cancelEdit(area: any): void {
    this.editCache[area.id].edit = false;

    if (this.editCache[area.id].new_item) {
      this.updateArrayAreas(area.id);
    } else {
      this.editCache[area.id] = area;
    }
  }

  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   *
   * @param {any} area Resource selected
   * @param {boolean} newItem determines if the resource is already saved
   */
  saveItem(area: any, newItem: boolean): void {
    const item = this.editCache[area.id];

    if (!item.name || !item.code || !item.ecoe) {
      return;
    }

    const body = {
      name: item.name,
      code: item.code,
      ecoe: this.ecoeId
    };

    const request = (
      newItem ?
        this.apiService.createResource('area', body) :
        this.apiService.updateResource(item['$uri'], body)
    );

    request.subscribe(response => {
      delete this.editCache[area.id];
      delete this.editCache[response['id']];

      this.editCache[response['id']] = {
        edit: false,
        ...response
      };

      this.areas = this.areas.map(x => (x.id === area.id) ? response : x);
    });
  }

  /**
   * Updates editCache variable with the same values of the resources array and adds a 'edit' key.
   */
  updateEditCache(): void {
    this.areas.forEach(item => {
      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        ...item
      };
    });
  }

  /**
   * Adds a new empty field to the resources array.
   * Then updates editCache with the new resource.
   */
  addArea() {
    this.apiService.getResources('area')
      .subscribe(areas => {
        this.index += this.sharedService.getLastIndex(areas);

        const newItem = {
          id: this.index,
          name: '',
          code: '',
          questions: [],
          ecoe: this.ecoeId
        };

        this.areas = [...this.areas, newItem];

        this.editCache[this.index] = {
          edit: true,
          new_item: true,
          ...newItem
        };
      });
  }

  /**
   * Deletes the editCache key assigned to the resource id passed and filters out the item from the resources array.
   *
   * @param {number} areaId Id of the resource passed
   */
  updateArrayAreas(areaId: number) {
    delete this.editCache[areaId];
    this.areas = this.areas.filter(x => x.id !== areaId);
  }
}
