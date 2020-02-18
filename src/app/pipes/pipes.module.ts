import { NgModule } from '@angular/core';
import {SanitizeHtmlPipe} from './sanitize-html/sanitize-html.pipe';
import { SecondsToMinutesPipe } from './ss-to-mm/seconds-to-minutes.pipe';
import { TimeToDatePipe } from './time-to-date/time-to-date.pipe';
import { HtmlTagsPipe } from './html-tags/html-tags.pipe';
import { StripHtmlPipe } from './strip-html/strip-html.pipe';

@NgModule({
  declarations: [
    SanitizeHtmlPipe,
    SecondsToMinutesPipe,
    TimeToDatePipe,
    HtmlTagsPipe,
    StripHtmlPipe
  ],
    exports: [
        SanitizeHtmlPipe,
        SecondsToMinutesPipe,
        TimeToDatePipe,
        HtmlTagsPipe,
        StripHtmlPipe
    ]
})
export class PipesModule {}
