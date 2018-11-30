import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  pageChanged: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor() {

  }

  setPageChanged(actualUrl: string) {
    this.pageChanged.next(actualUrl);
  }

  getPageChanged(): BehaviorSubject<string> {
    return this.pageChanged;
  }

  sortArray(first, second) {
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
}
