import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {ECOEConfig} from '../../models/chrono';

/**
 * Service for manage the status of ECOE evaluation
 */
@Injectable({
  providedIn: 'root'
})
export class ChronoService {

  private socket: SocketIOClient.Socket;
  private readonly URL_CHRONO = environment.CHRONO_ROUTE;
  private readonly API_ROUTE = environment.API_ROUTE;
  private readonly API_V1: string = '/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * Try to connect to the socket server and then send event when it was success.
   * @param round: Round id to do the connection
   * @return event when is connected.
   */
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

  /**
   *Any event received will be caught with this method (excluding onConnected).
   * @param event: the name of event whose want to be subscribed
   * @return an observable from the event name
   */
  onReceive(event: string) {
    return new Observable(observer => {
      this.socket.on(event, data => {
        observer.next([event, data]);
      });
    });
  }

  /**
   * Tries to disconnect the current instance from the web socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  /**
   * Runs/starts the ECOE
   * @param id ECOE identifier
   * @return http response
   */
  startECOE(id: number) {
    const COMMAND = '/ecoes/:id/start';
    const URL_V1 = this.API_ROUTE + this.API_V1 + COMMAND.replace(':id', id + '');

    return this.http.post(URL_V1, null);
  }

  /**
   * Pause all chronos
   * @param id ECOE identifier
   * @return http response
   */
  pauseECOE(id: number) {
    const COMMAND = '/ecoes/:id/pause';
    const URL_V1 = this.API_ROUTE + this.API_V1 + COMMAND.replace(':id', id + '');

    return this.http.post(URL_V1, null);
  }

  /**
   * Resume an ECOE that was started before
   * @param id ECOE identifier
   */
  playECOE(id: number) {
    const COMMAND = '/ecoes/:id/play';
    const URL_V1 = this.API_ROUTE + this.API_V1 + COMMAND.replace(':id', id + '');

    return this.http.post(URL_V1, null);
  }

  /**
   * Stop/abort current ECOE. Caution all timer progress will be lost
   * @param id ECOE identifier
   */
  abortECOE(id: number) {
    const COMMAND = '/ecoes/:id/abort';
    const URL_V1 = this.API_ROUTE + this.API_V1 + COMMAND.replace(':id', id + '');

    return this.http.post(URL_V1, null);
  }

  /**
   * Method for set visible an ECOE on outsider module,
   * Also is required for start this same ECOE
   * @param id ECOE identifier
   */
  publishECOE(id: number) {
    const COMMAND = '/ecoes/:id/publish';
    const URL_V1 = this.API_ROUTE + this.API_V1 + COMMAND.replace(':id', id + '');

    return this.http.post(URL_V1, null);
  }

  /**
   * Set to no public ECOE (draft)
   * @param id ECOE identifier
   */
  draftECOE(id: number) {
    const COMMAND = '/ecoes/:id/draft';
    const URL_V1 = this.API_ROUTE + this.API_V1 + COMMAND.replace(':id', id + '');

    return this.http.post(URL_V1, null);
  }

  /**
   * Pause chrono timer of an round
   * @param id Round identifier
   */
  pauseRound(id: number) {
    const COMMAND = '/rounds/:id/pause';
    const URL_V1 = this.API_ROUTE + this.API_V1 + COMMAND.replace(':id', id + '');
    return this.http.post(URL_V1, null);
  }

  /**
   * Resume round chrono
   * @param id Round identifier
   */
  playRound(id: number) {
    const COMMAND = '/rounds/:id/play';
    const URL_V1 = this.API_ROUTE + this.API_V1 + COMMAND.replace(':id', id + '');
    return this.http.post(URL_V1, null);
  }

  /**
   * Get back the configuration/s on an/all ECOE
   * @param id ECOE identifier
   */
  getChronoConfiguration(id?: number) {
    const command = '/configurations';
    const url = this.URL_CHRONO + command;

    return this.http.get(url)
      .pipe(
        map((response: ECOEConfig[]) => id ? response.filter(config => +config.ecoe.id === +id) : response)
      );
  }
}
