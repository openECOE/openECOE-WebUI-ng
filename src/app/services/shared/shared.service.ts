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
    if (!items[0]) {
      return 0;
    }

    return items.reduce((max, p) => p.id > max ? p.id : max, items[0].id);
  }

  /**
   * Return minutes and seconds converted to only seconds.
   *
   * @param {number} Number of minutes
   * @param {number} Number of seconds
   * @returns {number} Sum of minutes and seconds in seconds
   */
  toSeconds(minutes: number, seconds: number): number {
    return (minutes * 60) + seconds;
  }

  /**
   * Get an array of minutes and seconds with an input of seconds.
   *
   * @param {number} Number of seconds
   * @returns { minutes: number, seconds: number } Dictionary with values minutes and seconds
   */
  toMinutesSeconds(seconds: number): { minutes: number, seconds: number } {
    const min: number = Math.floor(seconds / 60);
    const sec: number = (seconds - min * 60);
    return {minutes: min, seconds: sec};
  }
}
