import {Injectable} from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {ActionMessagesService} from '../services/action-messages/action-messages.service';

@Injectable()
export class MessagesInterceptor implements HttpInterceptor {

  requestMethods: Array<{ method: string, actionOk: string, actionErr: string }> = [
    {method: 'PATCH', actionOk: 'UPDATED', actionErr: 'TO_UPDATE'},
    {method: 'POST', actionOk: 'CREATED', actionErr: 'TO_CREATE'},
    {method: 'DELETE', actionOk: 'DELETED', actionErr: 'TO_DELETE'},
  ];

  constructor(private actionMessagesService: ActionMessagesService,
              private translate: TranslateService) {

  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let requestMethod;
    if (request.method === 'DELETE' || request.method === 'POST' || request.method === 'PATCH') {
      requestMethod = this.requestMethods.find(req => req.method === request.method);
    }

    return next.handle(request)
      .pipe(
        tap(() => {
          if (requestMethod) {
            this.actionMessagesService.createSuccessMsg(
              this.translate.instant('ITEM_ACTION_SUCCESSFUL', {
                action: this.translate.instant(requestMethod.actionOk)
              })
            );
          }
        }),
        catchError((err: any) => {
          if (requestMethod) {
            this.actionMessagesService.createErrorMsg(
              this.translate.instant('ITEM_ACTION_ERROR', {
                action: this.translate.instant(requestMethod.actionErr)
              })
            );
          }
          return throwError(err);
        })
      );
  }
}
