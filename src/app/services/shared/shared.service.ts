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
}
