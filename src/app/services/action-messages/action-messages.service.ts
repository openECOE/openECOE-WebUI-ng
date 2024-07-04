import { Injectable } from '@angular/core';
import {NzMessageDataOptions, NzMessageRef, NzMessageService} from 'ng-zorro-antd/message';

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
   * @param message Message to show on the alert
   */
  createSuccessMsg(message: string, options?: NzMessageDataOptions): NzMessageRef {
    return this.nzMessageService.success(message, options);
  }

  /**
   * Generates an error alert message.
   *
   * @param message Message to show on the alert
   */
  createErrorMsg(message: string, options?: NzMessageDataOptions): NzMessageRef {
    return this.nzMessageService.error(message, options);
  }

  /**
   * Generates an warning alert message.
   *
   * @param message Message to show on the alert
   */
  createWarningMsg(message: string, options?: NzMessageDataOptions): NzMessageRef {
    return this.nzMessageService.warning(message, options);
  }

  removeMessage(messageId: string): void {
    this.nzMessageService.remove(messageId);
  }

}
