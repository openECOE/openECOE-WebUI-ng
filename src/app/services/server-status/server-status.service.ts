import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Observable, interval, of } from 'rxjs';
import { catchError, first, map, startWith, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ServerStatusService {

  private _isAvailable: Observable<boolean> = of(true);
  private _pollingInterval: number = 5000;

  constructor(
    private apiService: ApiService
  ) { 
      this._isAvailable = this.pollServer();
  }

  public get isAvailable(): Observable<boolean> {
    return this._isAvailable;
  }

  pollServer(): Observable<any> {
    return interval(this._pollingInterval)
      .pipe(
        startWith(0),
        switchMap(() => this.getServerStatus()),
        map((status: string) => status === 'ok' ? true : false)
      );
  }

  getServerStatus(): Observable<any> {
    return this.apiService.getServerStatus();
  }
}
