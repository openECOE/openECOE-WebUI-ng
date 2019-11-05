import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeToDate'
})
export class TimeToDatePipe implements PipeTransform {

  transform(value: Date, args?: any): any {
    return value.toLocaleString().split(' ', 1)[0];
  }

}
