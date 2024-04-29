import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Papa} from 'ngx-papaparse';

export interface ParserFile {
  filename: string;
  fields: string[];
  data: any[];
}

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
  @Input() fileURL: string;
  @Input() parserFile: ParserFile;

  isVisible: boolean;
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
    this.handleCancel();
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
      skipEmptyLines: true,
      quoteChar: '"',
      escapeChar: '"',
      complete: (results, file) => {
        this.parserResult.emit(results.data);
      },
    });
  }

  //Generate CSV file to download with papaparse
  generateCSV() {
    let csv = this.papaParser.unparse(
      {
        fields: this.parserFile.fields,
        data: this.parserFile.data,
      },
      {
        delimiter: ";",
        quotes: true,
        quoteChar: '"',
        escapeChar: '"',
        header: true,
      }
    );

    //Download file with generated CSV data and filename from parserFile.filename
    const BOMprefix = "\uFEFF";
    const blob = new Blob([BOMprefix + csv], { type: "text/csv;charset=" + document.characterSet });
    let url = window.URL.createObjectURL(blob);

    let a = document.createElement('a');
    a.href = url;
    a.download = this.parserFile.filename;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }


  openDDModal() {
    this.isVisible = true;
  }

  handleCancel() {
    this.isVisible = false;
  }
}
