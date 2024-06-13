import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { ApiService } from "@app/services/api/api.service";
import { ActivatedRoute, Router } from "@angular/router";
import * as mammoth from 'mammoth';
import { Packer, Document, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, ImageRun} from "docx";
import { saveAs } from "file-saver";
import { ECOE } from "@app/models";
import { from } from "rxjs";
import { TemplateService } from "@app/services/report-template/template.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import {TranslateService} from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: "app-generate-reports",
  templateUrl: "./generate-reports.component.html",
  styleUrls: ["./generate-reports.component.less"],
})
export class GenerateReportsComponent implements OnInit {
  ecoe: ECOE;
  ecoeId: number;
  ecoe_name: any;
  editorContent: string = '';

  varsList = {};
  varsNameList = {};

  config: any = {
    minHeight: 600,
    maxWidth: 900,
    buttons: "undo,redo,|,font,fontsize,|,bold,italic,underline,eraser,|,superscript,subscript,|,indent,outdent,left,center,right,justify,|,ul,table,selectall,hr,|,link,image,print,|,downloadDoc, uploadDoc,|,varsList,preview,fullsize,source",
    uploader: {
      insertImageAsBase64URI: true
    },
    iframe: true,
    iframeStyle: `
      body { margin: 24px 40px; padding: 10px; line-height: 1.0; }
      table { border: 1px solid #000; border-collapse: collapse; }
      table th, table td { border: 1px solid #000; padding: 5px; }
      table p { margin: 0; }
    `,
    controls: {
      font: {
        list: {
          '': 'Default',
          'Arial,sans-serif': 'Arial',
          'Calibri': 'Calibri',
          "'Times New Roman',Times,serif": 'Times New Roman',
          'Helvetica,sans-serif': 'Helvetica',
          'Roboto Medium,Arial,sans-serif': 'Roboto',
          'Georgia,serif': 'Georgia',
          'Verdana,Geneva,sans-serif': 'Verdana',
          'Tahoma,Geneva,sans-serif': 'Tahoma'
        }
      },
      varsList: {
        icon: 'source',
        list: this.varsNameList,
        exec: (editor, current, control) => {
          const selectedText = control.control.text;
          const variableKey = Object.keys(this.varsNameList).find(key => this.varsNameList[key] === selectedText);
          
          if (variableKey) {
              const varContent = this.varsList[variableKey];
              if (varContent) {
                  const escapedValue = varContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                  editor.selection.insertHTML(escapedValue);
              } else {
                  console.error(`La etiqueta ${selectedText} no está definida.`);
              }
          } else {
              console.error(`No se encontró ninguna clave para el texto seleccionado: ${selectedText}`);
          }
        },
        tooltip: 'Insertar etiqueta'
      },
      downloadDoc: {
        iconURL: '../assets/svg/download-file-icon.svg',
        exec: (editor, current, control) => {
          this.downloadAsDocx();
        },
        tooltip: 'Descargar docx'
      },
      uploadDoc: {
        iconURL: '../assets/svg/upload-file-icon.svg',
        exec: (editor, current, control) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.docx';
          input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files[0];
            if (file) {
              this.convertDocxToHtml(file);
            }
          };
          input.click();
        },
        tooltip: 'Subir docx'
      }
    }
  };
  
  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private template: TemplateService,
    private message: NzMessageService,
    private translate: TranslateService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.ecoeId = params.ecoeId;
      
      ECOE.fetch<ECOE>(this.ecoeId, { cache: false })
        .then((ecoe) => {
          this.ecoe = ecoe;
          this.ecoe_name = ecoe.name;
          this.getVariables();
          this.setTemplate(this.ecoe);
        })
    });
  }

  async setTemplate(ecoe:ECOE) {
    const template = await this.template.getTemplate(ecoe);
    if (template) {
      this.editorContent = template.html;
    }
  }

  async getVariables() {
    const response = await this.api.getResource(`ecoes/${this.ecoeId}/results/variables`).toPromise();
    const variables = response.variables;
    const descriptions = response.descriptions;
  
    // Función para procesar y agregar variables y descripciones a las listas
    const processVariablesAndDescriptions = (vars: any, descs: any) => {
      for (const [key, value] of Object.entries(vars)) {
        this.varsList[key] = `<<${value}>>`;
      }
      for (const [key, value] of Object.entries(descs)) {
        const description = value as string;
        if (description.length > 40) {
          this.varsNameList[key] = description.substring(0, 20) + '...' + description.substring(description.length - 13);
        } else {
          this.varsNameList[key] = description;
        }
      }
    };
  
    // Crea la lista en el orden deseado
    processVariablesAndDescriptions(variables.ecoe_variables, descriptions.ecoe_descriptions);
    processVariablesAndDescriptions(variables.student_variables, descriptions.student_descriptions);
    processVariablesAndDescriptions(variables.area_variables, descriptions.area_descriptions);
    processVariablesAndDescriptions(variables.stations_variables, descriptions.stations_descriptions);
    processVariablesAndDescriptions(variables.global_results_variables, descriptions.global_results_descriptions);
  }

  convertDocxToHtml(file: File) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      mammoth.convertToHtml({ arrayBuffer })
        .then((result) => {
          const htmlContent = result.value;

          const styles = result.messages.filter(msg => msg.type === 'warning' || msg.type === 'error').map(msg => msg.message).join('\n');
          const styledHtmlContent = `<html><head><style>${styles}</style></head><body>${htmlContent}</body></html>`;
          
          this.editorContent = htmlContent;
        })
        .catch((err) => {
          console.error('Error al convertir el archivo .docx a HTML:', err);
        });
    };
    reader.readAsArrayBuffer(file);
  }

  public downloadAsDocx(): void {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(this.editorContent, 'text/html');
    const children = this.parseHtmlToDocx(htmlDoc.body);

    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "plantillaECOE.docx");
      console.log("Documento creado y descargado exitosamente");
    }).catch((err) => {
      console.error('Error creating document:', err);
    });
  }

  private parseHtmlToDocx(element: HTMLElement): any[] {
    const docxElements = [];
  
    element.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        docxElements.push(new Paragraph({ children: [new TextRun(node.textContent || "")] }));
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
  
        switch (el.tagName) {
          case "P":
            docxElements.push(this.createParagraph(el));
            break;
          case "B":
          case "STRONG":
          case "I":
          case "EM":
          case "U":
            docxElements.push(new Paragraph({
              children: [this.createTextRun(el)],
              alignment: this.getAlignment(el),
            }));
            break;
          case "TABLE":
            docxElements.push(this.createTable(el));
            break;
          case "IMG":
            docxElements.push(this.createImage(el));
            break;
          default:
            docxElements.push(new Paragraph({
              children: [new TextRun(el.innerText)],
              alignment: this.getAlignment(el),
            }));
        }
        
        if (el.tagName === "P") {
          if (el.querySelector("img")) {
            const childElements = this.parseHtmlToDocx(el);
            docxElements.push(...childElements);
          }
        }
      }
    });
  
    return docxElements;
  }
  
  private createParagraph(element: HTMLElement): Paragraph {
    const textRuns = Array.from(element.childNodes).map(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        return new TextRun(child.textContent || "");
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        return this.createTextRun(el);
      }
      return new TextRun("");
    });
  
    return new Paragraph({ children: textRuns, alignment: this.getAlignment(element) });
  }

  private getFontFamily(element: HTMLElement): string | undefined {
    return element.style.fontFamily ? element.style.fontFamily.replace(/['"]/g, '') : undefined;
  }

  private createTextRun(element: HTMLElement): TextRun {
    const fontFamily = this.getFontFamily(element);
    const textOptions: any = {
      text: element.innerText,
      bold: element.tagName === "B" || element.tagName === "STRONG",
      italics: element.tagName === "I" || element.tagName === "EM",
      underline: element.tagName === "U" ? {} : undefined,
      font: fontFamily,
    };
  
    return new TextRun(textOptions);
  }
  
  private getAlignment(element: HTMLElement): AlignmentType | undefined {
    switch (element.style.textAlign) {
      case "center":
        return AlignmentType.CENTER;
      case "right":
        return AlignmentType.RIGHT;
      case "justify":
        return AlignmentType.JUSTIFIED;
      default:
        return AlignmentType.LEFT;
    }
  }

  private createTable(element: HTMLElement): Table {
    const rows = Array.from(element.getElementsByTagName("tr")).map(row => {
      const cells = Array.from(row.getElementsByTagName("td")).map(cell => {
        return new TableCell({
          children: [this.createParagraph(cell)]
        });
      });

      return new TableRow({ children: cells });
    });

    return new Table({ rows });
  }
  
  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private createImage(element: HTMLElement): Paragraph {
    const style = element.style;
    const imageUrl = element.getAttribute("src");
    if (imageUrl && imageUrl.startsWith("data:image")) {
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = this.base64ToUint8Array(base64Data);

      const width = style.getPropertyValue("width") || "150px";
      const height = style.getPropertyValue("height") || "175px";

      console.log("width:", width);
      console.log("height:", height);

      const widthValue = parseInt(width.replace("px", ""));
      const heightValue = parseInt(height.replace("px", ""));

      return new Paragraph({
        children: [
          new ImageRun({
            data: imageBuffer,
            transformation: {
              width: widthValue,
              height: heightValue
            }
          })
        ]
      });
    }
    return new Paragraph("");
  }
  
  onBack() {
    this.router.navigate(["/ecoe/" + this.ecoeId + "/results"]).finally();
  }

  saveTemplate(): void {
    const htmlString = this.editorContent;
    from(this.template.createTemplate(this.ecoe, htmlString)).subscribe(() => {
      console.log('Plantilla guardada exitosamente');
      this.createMessage('success');
    });
  }

  createMessage(type: string): void {
    this.message.create(type, this.translate.instant('TEMPLATE_SAVED'));
  }

  generateResult() {
    this.saveTemplate();
    this.generarReportes(this.ecoeId)
      .then(() => {
        this.router.navigate(["/ecoe/" + this.ecoeId + "/results"]).finally();
      })
      .catch(error => {
        console.error('Error al generar los reportes:', error);
      });
  }

  async generarReportes(ecoeId: number) {
    try {
      await this.api.postResource(`ecoes/${ecoeId}/results-report`).toPromise();
    } catch (error) {
      console.error('Error al generar los reportes:', error);
      throw error;
    }
  }
}
