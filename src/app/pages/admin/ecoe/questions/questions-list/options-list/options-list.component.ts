import {Component, Input, OnInit} from '@angular/core';
import {Option, Question} from '../../../../../../models';
import {forkJoin} from 'rxjs';
import {ApiService} from '../../../../../../services/api/api.service';
import {Router} from '@angular/router';
import {SharedService} from '../../../../../../services/shared/shared.service';
import {promise} from 'selenium-webdriver';

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
    this.loadOptionsByQuestion();
  }

  /**
   * Adds to the resource passed its array of options as a new key object.
   * Then updates the options cache.
   */
  loadOptionsByQuestion() {
    this.question.options.forEach(option => {
      this.editCacheOption[option.id] = {
        edit: this.editCacheOption[option.id] ? this.editCacheOption[option.id].edit : false,
        ...option
      };
    });
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

    if (!item.order || !item.label || item.points === null) {
      return;
    }

    const body = {
      order: +item.order,
      label: item.label,
      points: +item.points,
      question: question.id
    };

    const request = (
      newItem ? new Option(body).save() : option.update(body)
    );

    request.then(response => {
      delete this.editCacheOption[option.id];
      delete this.editCacheOption[response['id']];

      this.editCacheOption[response['id']] = {
        edit: false,
        ...response
      };

      question.options = question.options
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
  deleteOption(option: Option, question: any) {
    const idOption = option.id;

    option.destroy().then(() => {
      this.updateArrayOptions(idOption, question);
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
    question.options = question.options
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
    this.apiService.getResources('options')
      .subscribe(options => {
        this.indexOpt += this.sharedService.getLastIndex(options);

        const newItem = {
          id: this.indexOpt,
          order: this.question.options.length + 1,
          label: '',
          points: 0,
          question: question.id
        };

        question.options = [...question.options, newItem];

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
    const itemToMove = (direction === 'up') ? question.options[index - 1] : question.options[index + 1];

    const promises = [];

    promises.push(option.update({order: itemToMove.order}));
    promises.push(itemToMove.update({order: option.order}));

    Promise.all(promises).then(response => {
      response.map(res => {
        this.editCacheOption[res['id']] = res;

        question.options = question.options
          .map(x => (x.id === res.id ? res : x))
          .sort(this.sharedService.sortArray);
      });
    });
  }

}
