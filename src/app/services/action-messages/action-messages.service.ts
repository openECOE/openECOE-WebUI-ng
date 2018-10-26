import { Injectable } from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd';

@Injectable({
  providedIn: 'root'
})
export class ActionMessagesService {

  constructor(private nzMessageService: NzMessageService) {
  }

  createSuccessMsg(message: string) {
    this.nzMessageService.success(message);
  }

  createErrorMsg(message: string) {
    this.nzMessageService.error(message);
  }
}
