import {Component, Input, OnInit} from '@angular/core';
import {Papa} from 'ngx-papaparse';
import {ApiService} from '../../../services/api/api.service';

@Component({
  selector: 'app-upload-and-parse',
  templateUrl: './upload-and-parse.component.html',
  styleUrls: ['./upload-and-parse.component.less']
})
export class UploadAndParseComponent implements OnInit {

  @Input() ecoeId: number;
  @Input() resource: string;

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

  handleFile(fileString: string) {
    this.papaParser.parse(fileString, {
      header: true,
      dynamicTyping: true,
      step: (results, parser) => {
        const body = {
          ...results.data[0],
          ecoe: this.ecoeId
        };
        this.apiService.createResource('student', body).subscribe();
      }
    });
  }
}
