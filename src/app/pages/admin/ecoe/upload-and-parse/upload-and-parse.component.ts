import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Papa} from 'ngx-papaparse';

/**
 * Component with the upload files component and FileReader functionality.
 */
@Component({
  selector: 'app-upload-and-parse',
  templateUrl: './upload-and-parse.component.html',
  styleUrls: ['./upload-and-parse.component.less']
})
export class UploadAndParseComponent implements OnInit {
  @Output() parserResult = new EventEmitter();

  /**
   * Event handler on file upload.
   * Reads the file data and then calls [handleFile]{@link #handleFile} function.
   */
  handleUpload = (file: any) => {
    const fr = new FileReader();
    fr.onload = (e) => {
      file.onSuccess({}, file.file, 'success');
      this.handleFile(fr.result.toString());
    };
    fr.readAsText(file.file);
  }

  constructor(private papaParser: Papa) {
  }

  ngOnInit() {
  }

  /**
   * Parses the data string (CSV) to JSON and then creates the resources for each element.
   *
   * @param fileString File data as string
   */
  handleFile(fileString: string) {
    this.papaParser.parse(fileString, {
      header: true,
      dynamicTyping: true,
      complete: (results, file) => {
        this.parserResult.emit(results.data);
      }
    });
  }
}
