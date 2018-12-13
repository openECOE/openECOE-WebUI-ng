import { Injectable } from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd';

/**
 * Service with the NzMessageService methods.
 */
@Injectable({
  providedIn: 'root'
})
export class ActionMessagesService {

  constructor(private nzMessageService: NzMessageService) {
  }

  /**
   * Generates a success alert message.
   *
   * @param {string} message Message to show on the alert
   */
  createSuccessMsg(message: string) {
    this.nzMessageService.success(message);
  }

  /**
   * Generates an error alert message.
   *
   * @param {string} message Message to show on the alert
   */
  createErrorMsg(message: string) {
    this.nzMessageService.error(message);
  }
}
