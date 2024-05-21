import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
//import { NzFormModule } from "ng-zorro-antd";
import { stringify } from "querystring";
import { ApiService } from "@app/services/api/api.service";
import { ActivatedRoute, Router } from "@angular/router";
import { flatMap } from "rxjs/operators";
import { JoditAngularComponent } from 'jodit-angular';
import * as mammoth from 'mammoth';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { Packer, Document, Paragraph, TextRun, Table, TableRow, TableCell, Media, Drawing } from "docx";
import * as docx from "docx";
import { saveAs } from "file-saver";

@Component({
  selector: "app-generate-reports",
  templateUrl: "./generate-reports.component.html",
  styleUrls: ["./generate-reports.component.less"],
})
export class GenerateReportsComponent implements OnInit {
  @Output() form_data = new EventEmitter();

  dataSet: Dummy[] = [
    {
      area: "Area1",
      data1: "Dato 1",
      data2: "Dato 2",
    },
    {
      area: "Area1",
      data1: "Dato 1",
      data2: "Dato 2",
    },
  ];
  FData: any;
  text: any;
  signature_person: any;
  signer_status: any;
  signature_faculty: any;
  ecoeId: number;
  ecoe_name: any;
  editorContent: string = '';
  config: any = {
    "minHeight": 600,
    "buttons": "undo,redo,|,font,fontsize,|,bold,italic,underline,eraser,|,superscript,subscript,|,indent,outdent,left,center,right,justify,|,ul,table,selectall,hr,|,link,image,print,|,source,preview,fullsize",
    "uploader": {
      "insertImageAsBase64URI": true
    },
    iframe: true,
    iframeStyle: `
      body { margin: 24px 40px; padding: 10px; line-height: 1.0; }
      table { border: 1px solid #000; border-collapse: collapse; }
      table th, table td { border: 1px solid #000; padding: 5px; }
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
      }
    }
    
  };
  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.ecoeId = params.ecoeId;
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
      saveAs(blob, "document.docx");
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
  
  private getAlignment(element: HTMLElement): any {
    switch (element.style.textAlign) {
      case "center":
        return "center";
      case "right":
        return "right";
      case "justify":
        return docx.AlignmentType.JUSTIFIED;
      default:
        return "left";
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

  base64ToImage(base64Data: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = base64Data;
    });
  }
  

  private createImage(element: HTMLElement): Paragraph {
    const imageUrl = element.getAttribute("src");
    if (imageUrl) {
      return new Paragraph({
        children: [
          new TextRun({
            text: `![Image](${imageUrl})`,
            bold: true,
            break: 1
          })
        ]
      });
    }
    return new Paragraph("");
  }

  validateForm!: FormGroup;
  listOfControl: Array<{ id: number; controlInstance: string }> = [];

  addField(e?: MouseEvent): void {
    if (e) {
      e.preventDefault();
    }
    const id =
      this.listOfControl.length > 0
        ? this.listOfControl[this.listOfControl.length - 1].id + 1
        : 0;

    const control = {
      id,
      controlInstance: `signature${id}`,
    };
    const index = this.listOfControl.push(control);
    console.log(this.listOfControl[this.listOfControl.length - 1]);
    this.validateForm.addControl(
      this.listOfControl[index - 1].controlInstance,
      new FormControl(null, Validators.required)
    );
  }

  removeField(i: { id: number; controlInstance: string }, e: MouseEvent): void {
    e.preventDefault();
    if (this.listOfControl.length > 0) {
      const index = this.listOfControl.indexOf(i);
      this.listOfControl.splice(index, 1);
      console.log(this.listOfControl);
      this.validateForm.removeControl(i.controlInstance);
    }
  }

  onBack() {
    this.router.navigate(["/ecoe/" + this.ecoeId + "/results"]).finally();
  }
  submitData() {
    FData = {
      ecoe: (<HTMLInputElement>document.getElementById("ECOE_type")).value,
      faculty: (<HTMLInputElement>document.getElementById("faculty")).value,
      university: (<HTMLInputElement>document.getElementById("uni")).value,
      date: (<HTMLInputElement>document.getElementById("ECOE_date")).value,
      explanation_ECOE: (<HTMLInputElement>(
        document.getElementById("ECOE_explanation")
      )).value,
      explanation_results: (<HTMLInputElement>(
        document.getElementById("results_explanation")
      )).value,
      signatures: this.fillSignList(),
    };
    const FdataList = this.FData;
    //FdataList.push(this.listOfControl);
    var cadenaJSON = JSON.stringify(FData);
    //llamada a la api para enviar este objeto (post)
    let arearesults = this.api
      .postResource("ecoes/" + this.ecoeId + "/results-report", null, {
        cadenaJSON,
      })
      //Para poder hacer la redireccion  desde el observable se tiene que implementar un pipe con un flatmap dentro
      .pipe(
        flatMap(() =>
          this.router.navigate(["ecoe/" + this.ecoeId + "/results"])
        )
      );
    arearesults.subscribe();
  }

  fillSignList() {
    var signList: Array<listSign> = []; //revisar tipo / castear a listSign siendo objeto
    for (let i = 0; i < this.listOfControl.length; i++) {
      var sign_Element = document.getElementById(String(i));
      //castear a HTMLInputElement para que TS pille el valor
      SData = {
        text: (<HTMLInputElement>document.getElementById("st." + i)).value,

        profesor: (<HTMLInputElement>document.getElementById("sp." + i)).value,

        job: (<HTMLInputElement>document.getElementById("ss." + i)).value,

        faculty: (<HTMLInputElement>document.getElementById("sf." + i)).value,
      };
      signList.push(SData);
    }
    return signList;
  }
}
interface Dummy {
  area: string;
  data1: string;
  data2: string;
}
interface listSign {
  text: string;
  profesor: string;
  job: string;
  faculty: string;
}
interface formData {
  ecoe: string;
  faculty: string;
  university: string;
  date: string;
  explanation_ECOE: string;
  explanation_results: string;
  signatures: Array<listSign>;
}

let FData: formData;
let SData: listSign;
