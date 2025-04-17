import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { ECOE, Station } from '@app/models';
import { Papa } from 'ngx-papaparse';
import { ApiService } from '@app/services/api/api.service';
import { ActivatedRoute, Router } from "@angular/router";
import {getPotionID, Pagination} from '@openecoe/potion-client';
import { ActionMessagesService } from '@app/services/action-messages/action-messages.service';
import { TranslateService } from '@ngx-translate/core';

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
  @Output() importCompleted = new EventEmitter<void>();

  @Input() fileURL: string;
  @Input() parserFile: ParserFile;

  isStation: boolean;
  tabs: Array<{ name: string, icon: string, content: TemplateRef<any> }> = [];
  isVisible: boolean;
  stationsList: Station[] = [];
  selectedStations: any[] = [];
  ecoeList: any[] = [];
  selectedEcoe: any;
  selectedEcoeID: number;
  currentOrganization: any;
  ecoe: ECOE;
  ecoeID: number;
  ecoeId: number;
  stationsOptions:Array<{ label: string; value: Station; }> = [];

  page: number = 1;
  pagStations: Pagination<Station>;

  constructor(
    private papaParser: Papa,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private message: ActionMessagesService,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    if (this.parserFile.filename) {
      this.isStation = this.parserFile.filename.includes('stations');
    }

    if (this.isStation) {
      this.route.params.subscribe((params) => {
        this.ecoeId = params.ecoeId;
      });

      try {
        this.ecoe = await ECOE.fetch<ECOE>(this.ecoeId, { cache: false });
        this.ecoeID = this.ecoe.id;
      } catch (error) {
        console.error("Error fetching ECOE:", error);
      }

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

  getStationOptions() {
    return this.stationsList.map((station: Station) => {
      return {
        label: `${station.order} - ${station.name}`,
        value: station
      };
    });
  }

  async getStations() {
    this.selectedEcoeID = parseInt(this.selectedEcoe.$uri.split('/').pop());
    return new Promise(resolve => {
      Station.query<Station>({
        where: {ecoe: this.selectedEcoeID},
        sort: {order: false},
        page: this.page,
        perPage: 200
      }, {paginate: true})
        .then(response => {
          this.loadPage(response);
          this.stationsOptions = this.getStationOptions();
        })
        .catch(err => {
          if (err.status === 404) {
            this.page--;
            if (this.page > 0) {
              this.getStations().finally();
            }
          }
        })
        .finally(() => {
          resolve(null);
        });
    });
  }

  loadPage(pagination: Pagination<Station>  | Station[]) {
    this.pagStations = pagination as Pagination<Station>;
    this.stationsList = [];
    for (let station of this.pagStations.toArray()) {
      this.stationsList.push(Object.assign(new Station, station));
    }

    this.stationsList.map(value => {
      // Fix for SelfReference Station Type
      if (value.parentStation !== null && !value.parentStation.name) {
        Station.fetch<Station>(getPotionID(value.parentStation['$uri'], '/stations'))
          .then(parentStation => value.parentStation = parentStation);
      }
    });
    return;
  }

  async importStations(){
    try {
      const stationsID: number[] = this.selectedStations.map(s => {
        const id = parseInt(s.$uri.split('/').pop());
        return id;
      });
      this.apiService.cloneStations(this.ecoe, stationsID)
        .toPromise().then(() => this.importCompleted.emit());

      this.handleCancel();

      // Limpiar los selects
      this.selectedEcoe = null;
      this.selectedStations = [];
      this.stationsOptions = [];

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
      const fileContent = fr.result.toString();
      this.handleFile(fileContent);
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
    let isJson = false;

    // Intentar verificar si el archivo es JSON
    if (this.isStation) {
        try {
            const jsonObject = JSON.parse(fileString);
            if (jsonObject.blocks) {
                isJson = true;
                this.parserResult.emit({ items: [jsonObject], isJson });
                return;
            }
        } catch (e) {
            // No hacer nada aquí porque el archivo puede no ser JSON
        }
    }

    // Procesar como CSV si no es JSON
    this.papaParser.parse(fileString, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      quoteChar: '"',
      escapeChar: '"',
      transform: (value) => {
        const trimmedValue = value.trim();
        return trimmedValue === "" ? null : trimmedValue;
      },
      complete: (results, file) => {
        if (this.isStation)
          this.parserResult.emit({ items: results.data, isJson });
        else this.parserResult.emit(results.data);
      },
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
