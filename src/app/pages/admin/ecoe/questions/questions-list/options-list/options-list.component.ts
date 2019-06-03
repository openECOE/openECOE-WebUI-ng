import {Component, Input, OnInit} from '@angular/core';
import {Option, Question} from '../../../../../../models';
import {forkJoin} from 'rxjs';
import {ApiService} from '../../../../../../services/api/api.service';
import {Router} from '@angular/router';
import {SharedService} from '../../../../../../services/shared/shared.service';

@Component({
  selector: 'app-options-list',
  templateUrl: './options-list.component.html',
  styleUrls: ['./options-list.component.less']
})
export class OptionsListComponent implements OnInit {

  @Input() question: Question;

  editCacheOption: Array<any> = [];
  indexOpt: number = 1;
  valueopt: number;

  constructor(private apiService: ApiService,
              private sharedService: SharedService) {
  }

  ngOnInit() {
  }

  /**
   * Sets the editCacheOption variable to true.
   * Changes text-view tags by input tags.
   *
   * @param id Id of the selected resource
   */
  startEditOption(id: number) {
    this.editCacheOption[id].edit = true;
  }

  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again and sorts the array.
   *
   * @param option Resource selected
   * @param question Parent resource passed
   * @param newItem determines if the resource is already saved
   */
  saveOption(option: any, question: any, newItem: boolean) {
    const item = this.editCacheOption[option.id];

    if (!item.order || !item.label || !item.points) {
      return;
    }

    const body = {
      order: +item.order,
      label: item.label,
      points: +item.points,
      question: question.id
    };

    const request = (
      newItem ?
        this.apiService.createResource('option', body) :
        this.apiService.updateResource(item['$uri'], body)
    );

    request.subscribe(response => {
      delete this.editCacheOption[option.id];
      delete this.editCacheOption[response['id']];

      this.editCacheOption[response['id']] = {
        edit: false,
        ...response
      };

      question.optionsArray = question.optionsArray
        .map(x => (x.id === option.id ? response : x))
        .sort(this.sharedService.sortArray);
    });
  }

  /**
   * Sets the editCacheOption variable to false.
   * If resource is not already saved, calls [updateArrayOptions]{@link #updateArrayOptions} function.
   * Else resets editCache to the previous value.
   *
   * @param option Resource selected
   * @param question Parent resource passed
   */
  cancelEditOption(option: any, question: any) {
    this.editCacheOption[option.id].edit = false;

    if (this.editCacheOption[option.id].new_item) {
      this.updateArrayOptions(option.id, question);
    } else {
      this.editCacheOption[option.id] = option;
    }
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayOptions]{@link #updateArrayOptions} function.
   *
   * @param option Resource selected
   * @param question Parent resource passed
   */
  deleteOption(option: any, question: any) {
    this.apiService.deleteResource(option['$uri']).subscribe(() => {
      this.updateArrayOptions(option.id, question);
    });
  }

  /**
   * Deletes the editCacheOption key assigned to the resource id passed, filters out the item from the resources array and sorts the array.
   *
   * @param option Id of the resource passed
   * @param question Parent resource passed
   */
  updateArrayOptions(option: number, question: any) {
    delete this.editCacheOption[option];
    question.optionsArray = question.optionsArray
      .filter(x => x.id !== option)
      .sort(this.sharedService.sortArray);
  }

  /**
   * Adds a new empty field to the resources array.
   * Then updates editCacheOption with the new resource.
   *
   * @param question Parent resource passed
   */
  addOption(question: any) {
    this.apiService.getResources('option')
      .subscribe(options => {
        this.indexOpt += this.sharedService.getLastIndex(options);

        const newItem = {
          id: this.indexOpt,
          order: '',
          label: '',
          points: 0,
          question: question.id
        };

        question.optionsArray = [...question.optionsArray, newItem];

        this.editCacheOption[this.indexOpt] = {
          edit: true,
          new_item: true,
          ...newItem
        };
      });
  }

  /**
   * Moves the option one position above or down.
   * Updates the order key of the resource passed and the next to it.
   * Then updates the variables to avoid calling the backend again and sorts the array.
   *
   * @param direction 'up' or 'down'
   * @param option Resource passed
   * @param index Current index of the selected resource
   * @param question Parent resource passed
   */
  changeOptionOrder(direction: string, option: any, index: number, question: any) {
    const itemToMove = (direction === 'up') ? question.optionsArray[index - 1] : question.optionsArray[index + 1];

    forkJoin(
      this.apiService.updateResource(option['$uri'], {order: itemToMove.order}),
      this.apiService.updateResource(itemToMove['$uri'], {order: option.order})
    ).subscribe(response => {
      response.forEach(res => {
        this.editCacheOption[res['id']] = res;

        question.optionsArray = question.optionsArray
          .map(x => (x.id === res.id ? res : x))
          .sort(this.sharedService.sortArray);
      });
    });
  }

}
