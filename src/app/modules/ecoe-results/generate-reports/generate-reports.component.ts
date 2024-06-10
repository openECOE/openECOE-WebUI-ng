import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { ApiService } from "@app/services/api/api.service";
import { ActivatedRoute, Router } from "@angular/router";
import * as mammoth from 'mammoth';
import { Packer, Document, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, Media, Drawing, ImageRun} from "docx";
import { saveAs } from "file-saver";
import { ECOE } from "@app/models";
import { from } from "rxjs";
import { TemplateService } from "@app/services/report-template/template.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import {TranslateService} from '@ngx-translate/core';

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
  
  varsList = {
    full_name: '<<full_name>>',
    dni: '<<dni>>',
    date: '<<date>>',
    ref_ecoe: '<<ref_ecoe>>'
  };
  varsNameList = {
    full_name: 'Nombre completo',
    dni: 'DNI',
    date: 'Fecha',
    ref_ecoe: 'Referencia ECOE'
  };

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
        icon: `<svg fill="#000000" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 489.104 489.104" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M411.55,100.9l-94.7-94.7c-4.2-4.2-9.4-6.2-14.6-6.2H92.15c-11.4,0-20.8,9.4-20.8,20.8v330.8c0,11.4,9.4,20.8,20.8,20.8 h132.1V421l-16.6-15.2c-8.3-7.3-21.8-7.3-29.1,1s-7.3,21.8,1,29.1l52,47.9c3.1,3.1,14.6,10.2,29.1,0l52-47.9 c8.3-8.3,8.3-20.8,1-29.1c-8.3-8.3-20.8-8.3-29.1-1l-18.7,17.2v-50.5h132.1c11.4,0,19.8-9.4,19.8-19.8V115.5 C417.85,110.3,415.75,105.1,411.55,100.9z M324.15,70.4l39.3,38.9h-39.3V70.4z M265.95,331.9v-130c0-11.4-9.4-20.8-20.8-20.8 c-11.4,0-20.8,9.4-20.8,20.8v130h-111.3V41.6h169.6v86.3c0,11.4,9.4,20.8,20.8,20.8h74.9v183.1h-112.4V331.9z"></path> </g> </g></svg>`,
        exec: (editor, current, control) => {
          this.downloadAsDocx();
        },
        tooltip: 'Descargar docx'
      },
      uploadDoc: {
        icon: '<svg fill="#000000" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 488.9 488.9" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M411.448,100.9l-94.7-94.7c-4.2-4.2-9.4-6.2-14.6-6.2h-210.1c-11.4,0-20.8,9.4-20.8,20.8v330.8c0,11.4,9.4,20.8,20.8,20.8 h132.1v95.7c0,11.4,9.4,20.8,20.8,20.8s20.8-9.4,20.8-19.8v-96.6h132.1c11.4,0,19.8-9.4,19.8-19.8V115.5 C417.748,110.3,415.648,105.1,411.448,100.9z M324.048,70.4l39.3,38.9h-39.3V70.4z M378.148,331.9h-112.3v-82.8l17.7,16.3 c10,10,25,3.1,28.1-1c7.3-8.3,7.3-21.8-1-29.1l-52-47.9c-8.3-7.3-20.8-7.3-28.1,0l-52,47.9c-8.3,8.3-8.3,20.8-1,29.1 c8.3,8.3,20.8,8.3,29.1,1l17.7-16.3v82.8h-111.4V41.6h169.6v86.3c0,11.4,9.4,20.8,20.8,20.8h74.9v183.2H378.148z"></path> </g> </g></svg>',
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
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.ecoeId = params.ecoeId;
      
      ECOE.fetch<ECOE>(this.ecoeId, { cache: false })
        .then((ecoe) => {
          this.ecoe = ecoe;
          this.ecoe_name = ecoe.name;
          this.setAreaNames(this.ecoe);
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

  setAreaNames(ecoe: ECOE) {
    const areasObservable = from(this.api.getAreasByEcoe(ecoe));

    areasObservable.subscribe((data) => {
        data.sort((a, b) => a.code.localeCompare(b.code));
        data.forEach((element) => {
            this.varsList[element.name + '_punt'] = `<<${element.name.substring(0, 3).toLocaleLowerCase() + '_punt_' + element.code}>>`;
            this.varsList[element.name + '_med'] = `<<${element.name.substring(0, 3).toLocaleLowerCase() + '_med_' + element.code}>>`;
            this.varsList[element.name + '_pos'] = `<<${element.name.substring(0, 3).toLocaleLowerCase() + '_pos_' + element.code}>>`;
            if (element.name.length > 25) {
              this.varsNameList[element.name + '_punt'] = element.name.substring(0, 25) + '...(Puntuación)';
              this.varsNameList[element.name + '_med'] = element.name.substring(0, 25) + '...(Mediana)';
              this.varsNameList[element.name + '_pos'] = element.name.substring(0, 25) + '...(Posición)';
            } else {
              this.varsNameList[element.name + '_punt'] = element.name + ' (Puntuación)';
              this.varsNameList[element.name + '_med'] = element.name + ' (Mediana)';
              this.varsNameList[element.name + '_pos'] = element.name + ' (Posición)';
            }
        });
    });
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
}
