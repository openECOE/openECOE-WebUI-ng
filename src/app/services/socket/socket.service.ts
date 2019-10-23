import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: SocketIOClient.Socket;
  // TODO: READ URL FROM ENV FILE
  private readonly url = 'http://openecoe.umh.es:6080/round';

  constructor() {}

  onConnected(round: number) {
    this.socket = io.connect(this.url + round, {
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

}
