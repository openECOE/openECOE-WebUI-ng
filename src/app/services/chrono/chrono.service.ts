import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {Observable, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {catchError, map, switchMap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChronoService {

  private socket: SocketIOClient.Socket;
  private readonly URL_CHRONO = environment.CHRONO_ROUTE;
  private readonly URL_API: string = 'api/v1';

  constructor(private http: HttpClient) {}

  onConnected(round: number) {
    const command = '/round';
    this.socket = io.connect(this.URL_CHRONO + command + round, {
      transports: ['websocket'],
      reconnectionDelayMax: 1000,
      forceNew: true
    });
    return Observable.create(observer =>
      this.socket.on('connect', data =>
        observer.next(['connect', data])
      )
    );
  }

  onReceive(event: string) {
    return new Observable(observer => {
      this.socket.on(event, data => {
        observer.next([event, data]);
      });
    });
  }

  disconect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  startECOE(ecoeId: number) {
    const command = '/start';

    return this.getConfigrationECOE((ecoeId))
      .pipe( switchMap(result =>
        this.loadConfigurationECOE(result)
          .pipe(switchMap(() =>
            this.http.get(this.URL_CHRONO + command, {responseType: 'text'})
          ), catchError( err => throwError(err)) )
      ));
  }

  pauseECOE(round?: number) {
    const command = (round) ? '/pause/' + round : '/pause';
    const url = this.URL_CHRONO + command;
    return this.http.get(url);
  }

  playECOE(round?: number) {
    const command = (round) ? '/play/' + round : '/play';
    const url = this.URL_CHRONO + command;
    return this.http.get(url);
  }

  abortECOE(): Observable<Object> {
    const command = '/abort';
    return this.http.post(this.URL_CHRONO + command, null, {});
  }

  getConfigrationECOE(ecoeId: number) {
    const command = '/configuration';
    const url = `${environment.API_ROUTE}/${this.URL_API}/ecoes/${ecoeId + command}`;
    return this.http.get(url);
  }

  private loadConfigurationECOE(configuration: any): Observable<Object> {
    const command = '/load';
    const url = this.URL_CHRONO + command;

    // @ts-ignore
    return this.http.post<string>(url, JSON.parse(JSON.stringify(configuration)), {responseType: 'text'})
      .pipe(
        map((response: any) => response.toString()),
        catchError( err => throwError(err) )
      );
  }

}
