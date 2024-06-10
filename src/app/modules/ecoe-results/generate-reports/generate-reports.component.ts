import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
//import { NzFormModule } from "ng-zorro-antd";
import { stringify } from "querystring";
import { ApiService } from "@app/services/api/api.service";
import { ActivatedRoute, Router } from "@angular/router";
import { flatMap } from "rxjs/operators";
import * as mammoth from 'mammoth';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { Packer, Document, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, Media, Drawing, ImageRun} from "docx";
import * as docx from "docx";
import { saveAs } from "file-saver";
import { ECOE, Template } from "@app/models";
import { from } from "rxjs";
import { dirname } from "path";
import { TemplateService } from "@app/services/report-template/template.service";

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
    buttons: "undo,redo,|,font,fontsize,|,bold,italic,underline,eraser,|,superscript,subscript,|,indent,outdent,left,center,right,justify,|,ul,table,selectall,hr,|,link,image,print,|,varsList,source,preview,fullsize",
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
    }
    
    }
  };
  
  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private template: TemplateService
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

  onFileSelected(event: NzUploadChangeParam) {
    const file = event.file.originFileObj as File;
    if (file) {
      this.convertDocxToHtml(file);
    }
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

  public saveTemplate(): void {
    const htmlString = this.editorContent;
    from(this.template.createTemplate(this.ecoe, htmlString)).subscribe((template) => {
      console.log("Plantilla guardada exitosamente:", template);
      this.router.navigate(["/ecoe/" + this.ecoeId + "/results"]);
    });
  }
}
