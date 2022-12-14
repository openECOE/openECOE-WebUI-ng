import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { NzFormModule } from "ng-zorro-antd";
import { stringify } from "querystring";
import { ApiService } from "@app/services/api/api.service";
import { ActivatedRoute, Router } from "@angular/router";
import { flatMap } from "rxjs/operators";

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
