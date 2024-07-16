import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { ECOE, Station } from '@app/models';
import { Papa } from 'ngx-papaparse';
import { ApiService } from '@app/services/api/api.service';
import { ActivatedRoute, Router } from "@angular/router";

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
  ecoe: ECOE;
  ecoeID: number;
  ecoeId: number;
  stationsOptions:Array<{ label: string; value: Station; }> = [];

  constructor(
    private papaParser: Papa,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    if (this.parserFile.filename) {
      this.isStation = this.parserFile.filename.includes('stations');
    }

    this.route.params.subscribe((params) => {
      this.ecoeId = params.ecoeId;
    });

    try {
      this.ecoe = await ECOE.fetch<ECOE>(this.ecoeId, { cache: false });
      this.ecoeID = this.ecoe.id;
    } catch (error) {
      console.error("Error fetching ECOE:", error);
    }

    if (this.isStation) {
      this.initializeTabs();
      await this.getCurrentOrganization();
      await this.getEcoes();
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

  async getCurrentOrganization() {
    try {
      const response: any = await this.apiService.getResource('users/me').toPromise();
      this.currentOrganization = response.organization.$ref;
    } catch (error) {
      console.warn("Error fetching current organization:", error);
    }
  }

  async getEcoes() {
    try {
      const response: any = await this.apiService.getResource('ecoes').toPromise();
      this.ecoeList = Object.values(response)
        .filter((ecoe: any) => ecoe.organization.$ref === this.currentOrganization && ecoe.$uri !== '/backend/api/v1/ecoes/' + this.ecoeID);
    } catch (error) {
      console.warn("Error fetching ECOEs:", error);
    }
  }

  async getStations() {
    try {
      const response: any = await this.apiService.getResource('stations').toPromise();
      this.stationsList = Object.values(response)
        .filter((station: Station) => station.ecoe.$ref === this.selectedEcoe.$uri);
      this.stationsOptions = this.getStationOptions();
    } catch (error) {
      console.warn("Error fetching stations:", error);
    }
  }

  getStationOptions() {
    return this.stationsList.map((station: Station) => {
      return {
        label: `${station.order} - ${station.name}`,
        value: station
      };
    });
  }

  async importStations(){
    try{
      const stationsID: number[] = this.selectedSations.map(s => {
        const id = parseInt(s.$uri.split('/').pop());
        return id;
      });
      await this.apiService.cloneStations(this.ecoe, stationsID);
      this.handleCancel();
    } catch (error) {
      console.warn("Error importing stations:", error);
    }
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
