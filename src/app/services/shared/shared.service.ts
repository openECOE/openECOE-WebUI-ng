import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FormGroup} from '@angular/forms';

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
   * @param actualUrl Url path
   */
  setPageChanged(actualUrl: string) {
    this.pageChanged.next(actualUrl);
  }

  /**
   * Gets the current page path.
   *
   * @returns The state of pageChanged
   */
  getPageChanged(): BehaviorSubject<string> {
    return this.pageChanged;
  }

  /**
   * Sorts an array of objects by its order keys.
   *
   * @param first First item
   * @param second Second second
   * @returns If the current item must be positioned before, after or on same position
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
   * @param items Array of items
   * @returns The last id
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
   * @param minutes Number of minutes
   * @param seconds Number of seconds
   * @returns Sum of minutes and seconds in seconds
   */
  toSeconds(minutes: number, seconds: number): number {
    return (minutes * 60) + seconds;
  }

  /**
   * Get an array of minutes and seconds with an input of seconds.
   *
   * @param seconds Number of seconds
   * @returns Dictionary with values minutes and seconds
   */
  toMinutesSeconds(seconds: number): { minutes: number, seconds: number } {
    const min: number = Math.floor(seconds / 60);
    const sec: number = (seconds - min * 60);
    return {minutes: min, seconds: sec};
  }

  /**
   * Generate an hexadecimal color from any string
   *
   * @param str String from we generate color to
   * @returns Hexadecimal color string
   */
  stringToColour(str: string): string {
    let colour = '#';
    if (str) {

      let hash = 0;
      const randStr = (str.slice(str.length / 2, str.length) + str.slice(0, str.length / 2)).replace(/\s/g, '').toLowerCase();

      for (let i = 0; i < randStr.length; i++) {
        hash = randStr.charCodeAt(i) + ((hash << 5) - hash);
      }
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
      }

    }
    return colour;
  }

  generateRandomPassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  cleanForm(form: FormGroup): void {
    form.reset();
    for (const key of Object.keys(form.controls)) {
      form.controls[key].markAsPristine();
      form.controls[key].updateValueAndValidity();
    }
  }

}
