import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { ECOE, Station } from '@app/models';
import { Papa } from 'ngx-papaparse';
import { ApiService } from '@app/services/api/api.service';
import { get } from 'http';

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
  @ViewChild('importTemplate', { static: true }) importTemplate: TemplateRef<any>;
  @ViewChild('ecoesTemplate', { static: true }) ecoesTemplate: TemplateRef<any>;

  @Output() parserResult = new EventEmitter();
  @Input() fileURL: string;
  @Input() parserFile: ParserFile;

  isStation: boolean;
  tabs: Array<{ name: string, icon: string, content: TemplateRef<any> }> = [];
  isVisible: boolean;
  stationsList: any[] = [];
  selectedSations: any[] = [];
  ecoeList: any[] = [];
  selectedEcoe: any;
  currentOrganization: any;

  constructor(private papaParser: Papa, private apiService: ApiService) {}

  ngOnInit() {
    if (this.parserFile.filename) {
      this.isStation = this.parserFile.filename.includes('stations');
    }

    if (this.isStation) {
      this.initializeTabs();
      this.getCurrentOrganization();
      this.getEcoes();
  
    }
  }

  initializeTabs() {
    this.tabs = [
      {
        name: 'Fichero',
        icon: 'file-add',
        content: this.importTemplate
      },
      {
        name: 'ECOE',
        icon: 'container',
        content: this.ecoesTemplate
      }
    ];
  }

  getCurrentOrganization() {
    this.apiService.getResource('users/me').subscribe(
      (response: any) => {
        this.currentOrganization = response.organization.$ref;
      },
      error => {
        console.warn(error);
      }
    );
  }

  getEcoes() {
    this.apiService.getResource('ecoes').subscribe(
      (response: any) => {
        this.ecoeList = Object.values(response)
          .filter((ecoe: ECOE) => ecoe.organization.$ref === this.currentOrganization);
          console.log(this.ecoeList);
      },
      error => {
        console.warn(error);
      }
    );
  }

  getStations() {
    console.log(this.selectedEcoe);
    this.apiService.getResource('stations').subscribe(
      (response: any) => {
        this.stationsList = Object.values(response)
          .filter((station: Station) => station.ecoe.$ref === this.selectedEcoe.$uri);
      },
      error => {
        console.warn(error);
      }
    );
  }

  getStationOptions() {
    return this.stationsList.map((station: Station) => {
      return {
        label: `${station.order} - ${station.name}`,
        value: station
      };
    });
  }

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
      }
    });
  }

  // Generate CSV file to download with papaparse
  generateCSV() {
    const csv = this.papaParser.unparse({
      fields: this.parserFile.fields,
      data: this.parserFile.data,
    }, {
      delimiter: ";",
      quotes: true,
      quoteChar: '"',
      escapeChar: '"',
      header: true,
    });

    // Download file with generated CSV data and filename from parserFile.filename
    const BOMprefix = "\uFEFF";
    const blob = new Blob([BOMprefix + csv], { type: "text/csv;charset=" + document.characterSet });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
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
