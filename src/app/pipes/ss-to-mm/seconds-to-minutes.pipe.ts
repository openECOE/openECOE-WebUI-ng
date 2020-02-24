import {Pipe, PipeTransform} from '@angular/core';
import {padStart} from 'ng-zorro-antd';

@Pipe({
  name: 'secondsToMinutes'
})
export class SecondsToMinutesPipe implements PipeTransform {

  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return padStart(minutes.toString(), 2, '0') + ':' + padStart((value - minutes * 60).toString(), 2, '0');
  }
}
