import {Component, Input, OnInit} from '@angular/core';
import {Papa} from 'ngx-papaparse';
import {ApiService} from '../../../../services/api/api.service';

/**
 * Component with the upload files component and FileReader functionality.
 */
@Component({
  selector: 'app-upload-and-parse',
  templateUrl: './upload-and-parse.component.html',
  styleUrls: ['./upload-and-parse.component.less']
})
export class UploadAndParseComponent implements OnInit {

  @Input() ecoeId: number;
  @Input() resource: string;

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

  constructor(private papaParser: Papa,
              private apiService: ApiService) { }

  ngOnInit() {
  }

  /**
   * Parses the data string (CSV) to JSON and then creates the resources for each element.
   *
   * @param {string} fileString File data as string
   */
  handleFile(fileString: string) {
    this.papaParser.parse(fileString, {
      header: true,
      dynamicTyping: true,
      step: (results, parser) => {
        const body = {
          ...results.data[0],
          ecoe: this.ecoeId
        };
        this.apiService.createResource(this.resource, body).subscribe();
      }
    });
  }
}
