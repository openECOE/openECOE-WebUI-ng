import { Pipe, PipeTransform } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
  name: 'textdate',
})
export class TextDatePipe implements PipeTransform {

  constructor(public translate: TranslateService) {

  }

  transform(val: string, fullDate?: boolean, separator?: string, ...args) {

    if (val == null) {
      return '';
    }

    const value = new Date(val).toString();


    const hhMMss2hhMM = (( str ) => {
      const sept = separator || ' ';
      const fullHour = str.split(sept)[4];
      const hhmm = fullHour ? fullHour.substring(0, 5) : '';

      return ', ' + hhmm;
    });


    let date;

    function pad(n, width, z) {
      z = z || '0';
      n = n + '';
      return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    const today = new Date();
    today.setHours(0, 0 , 0, 0);

    const yesterday = new Date();
    yesterday.setHours(0, 0 , 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);

    const inputDate = new Date(value);

    inputDate.setHours(0, 0, 0, 0);

    let todayOrYesterday = false;
    if (inputDate.getTime() === today.getTime()) {
      date = this.translate
        .instant('TIME_TODAY') + ', ' + pad(new Date(value).getHours(), 2, '0') + ':' + pad(new Date(value).getMinutes(), 2, '0');
        todayOrYesterday = true;
    } else if (inputDate.getTime() === yesterday.getTime()) {
      date = this.translate
        .instant('TIME_YESTERDAY') + ', ' + pad(new Date(value).getHours(), 2, '0') + ':' + pad(new Date(value).getMinutes(), 2, '0');
        todayOrYesterday = true;
    } else {

      let dateOptions;
      if (inputDate.getFullYear() === today.getFullYear()) {
        dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };

      } else {
        dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      }

      date = inputDate.toLocaleDateString(this.translate.currentLang, dateOptions);
    }

    return fullDate && !todayOrYesterday ? date + hhMMss2hhMM(value) : date;
  }
}
