import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

/**
 * Service with shared methods used around the app.
 */
@Injectable({
  providedIn: 'root'
})
export class SharedService {

  /**
   * Observable used to control if the current page changed and get it state on other component.
   */
  pageChanged: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor() {

  }

  /**
   * Emits a new value of pageChanged BehaviourSubject.
   *
   * @param {string} actualUrl Url path
   */
  setPageChanged(actualUrl: string) {
    this.pageChanged.next(actualUrl);
  }

  /**
   * Gets the current page path.
   *
   * @returns {BehaviorSubject<string>} The state of pageChanged
   */
  getPageChanged(): BehaviorSubject<string> {
    return this.pageChanged;
  }

  /**
   * Sorts an array of objects by its order keys.
   *
   * @param {any} first First item
   * @param {any} second Second second
   * @returns {number} If the current item must be positioned before, after or on same position
   */
  sortArray(first: any, second: any): number {
    if (!first.order) {
      return 0;
    }

    if (first.order < second.order) {
      return -1;
    }

    if (first.order > second.order) {
      return 1;
    }

    return 0;
  }

  /**
   * Gets the last id of the passed array of objects.
   *
   * @param {any[]} items Array of items
   * @returns {number} The last id
   */
  getLastIndex(items: any[]): number {
    return items.reduce((max, p) => p.id > max ? p.id : max, items[0].id);
  }
}
