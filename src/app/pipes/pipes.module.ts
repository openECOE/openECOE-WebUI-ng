import { NgModule } from '@angular/core';
import {SanitizeHtmlPipe} from './sanitize-html/sanitize-html.pipe';
import { SecondsToMinutesPipe } from './seconds-to-minutes.pipe';

@NgModule({
  declarations: [
    SanitizeHtmlPipe,
    SecondsToMinutesPipe
  ],
  exports: [
    SanitizeHtmlPipe,
    SecondsToMinutesPipe
  ]
})
export class PipesModule {}
