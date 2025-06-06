import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Observable, interval, of } from 'rxjs';
import { catchError, first, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ServerStatusService {

  private _isAvailable: Observable<boolean>;
  private _pollingInterval: number = 10000;

  constructor(
      private apiService: ApiService) { 
      this._isAvailable = this.pollServer().pipe
      (
        shareReplay({bufferSize: 1, refCount: true})
      );
  }

  public get isAvailable(): Observable<boolean> {
    return this._isAvailable;
  }

  pollServer(): Observable<boolean> {
    return interval(this._pollingInterval)
      .pipe(
        startWith(0),
        switchMap(() => this.getServerStatus()),
        map((status: string) => {
          return status === 'ok' ? true : false
        })
      );
  }

  getServerStatus(): Promise<any> {
    return this.apiService.getServerStatus();
  }
}
