import { NgModule } from '@angular/core';
import {SanitizeHtmlPipe} from './sanitize-html/sanitize-html.pipe';
import { SecondsToMinutesPipe } from './seconds-to-minutes.pipe';
import { TextDatePipe } from './textdate/textdate.pipe';
import {TimeToDatePipe} from './time-to-date/time-to-date.pipe';
import { FilterPipe } from './filter/filter.pipe';

@NgModule({
  declarations: [
    SanitizeHtmlPipe,
    SecondsToMinutesPipe,
    TextDatePipe,
    TimeToDatePipe,
    FilterPipe
  ],
    exports: [
        SanitizeHtmlPipe,
        SecondsToMinutesPipe,
        TextDatePipe,
        TimeToDatePipe,
        FilterPipe
    ]
})
export class PipesModule {}
