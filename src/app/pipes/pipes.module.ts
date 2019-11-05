import { NgModule } from '@angular/core';
import {SanitizeHtmlPipe} from './sanitize-html/sanitize-html.pipe';
import { SecondsToMinutesPipe } from './seconds-to-minutes.pipe';
import { TimeToDatePipe } from './time-to-date/time-to-date.pipe';

@NgModule({
  declarations: [
    SanitizeHtmlPipe,
    SecondsToMinutesPipe,
    TimeToDatePipe
  ],
  exports: [
    SanitizeHtmlPipe,
    SecondsToMinutesPipe,
    TimeToDatePipe
  ]
})
export class PipesModule {}
