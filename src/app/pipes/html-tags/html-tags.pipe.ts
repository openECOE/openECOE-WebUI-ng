import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import * as autolinker from 'autolinker';

@Pipe({
  name: 'htmlTags'
})
export class HtmlTagsPipe implements PipeTransform {

  constructor(private _sanitizer: DomSanitizer) { }

  transform(value: string) {
    const regexOnclick = /onclick=['"]([\S]+)['"]/g;
    value = value.replace(regexOnclick, '');
    value = autolinker.link(value, { newWindow: false });
    const regexImg = /href=['"]([\S]+)['"]/g;
    const replaceValueImg: string = `onClick="window.open('$1', '_system', 'location=yes')"`;
    value = value.replace(regexImg, replaceValueImg);
    return this._sanitizer.bypassSecurityTrustHtml(value);
  }

}
