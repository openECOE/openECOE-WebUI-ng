import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Area, ECOE } from "../../../models";
import { ApiService } from "@app/services/api/api.service";
import { NzTableSortFn, NzTableSortOrder } from "ng-zorro-antd";
import { zip } from "rxjs";

class Puntuacion {
  idStudent?: number;
  name?: string;
  surnames?: string;
  dni?: string;
  points?: number;
  absoluteScore?: number;
  relativeScore?: number;
  pos?: number;
  median?: number;
  perc?: number;

  sortOrder?: NzTableSortOrder;
  sortFn?: NzTableSortFn;
  sortDirections?: NzTableSortOrder[];
}
@Component({
  selector: "app-grades",
  templateUrl: "./grades.component.html",
  styleUrls: ["./grades.component.less"],
})
export class GradesComponent implements OnInit {
  ecoe: ECOE;
  ecoeId: number;
  ecoe_name: string;

  results: Puntuacion[];
  totalItems: number = 0;

  current_page: number = 1;
  per_page: number = 10;

  current_page_byarea: number = 1;
  per_page_byarea: number = 10;

  cargarByArea: boolean = true;
  headerResultsByArea: any[] = [];
  bodyResultsByArea: any[] = [];
  bodyResultsByAreaStructure: any[] = [];

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.ecoeId = +params.ecoeId;

      ECOE.fetch<ECOE>(this.ecoeId, { cache: false }).then((value) => {
        this.ecoe = value;
        this.ecoe_name = this.ecoe.name;

        const excludeItems = [];

        this.ecoe.results().then((response: Puntuacion[]) => {
          this.results = response.sort((a, b) => b.points - a.points);
          this.totalItems = response.length;
          this.resultsByArea();
        });
      });
    });
  }

  pageChange() {
    //TODO:: Esto habrá que adaptarlo cuando se ponga paginación en backend
    //this.loadAreas();
  }

  pageSizeChange(tabla: string, newpageSize: number) {
    this[tabla] = newpageSize;
    //TODO:: Esto habrá que adaptarlo
    this.resetCurrentPage(tabla);
    //this.loadAreas();
  }

  resetCurrentPage(tabla) {
    this[tabla] = 1;
  }

  onBack() {
    this.router.navigate(["/ecoe/" + this.ecoeId + "/results"]).finally();
  }

  downloadCSV() {
    this.api
      .getResourceFile("ecoes/" + this.ecoeId + "/results-csv")
      .subscribe((results) => {
        const blob = new Blob([results], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "Resultados " + this.ecoe.name + ".csv";

        document.body.appendChild(link);

        link.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );

        document.body.removeChild(link);
      });
  }

  sortId = (a: Puntuacion, b: Puntuacion) => b.idStudent - a.idStudent;
  sortDni = (a: Puntuacion, b: Puntuacion) => a.dni.localeCompare(b.dni);
  sortName = (a: Puntuacion, b: Puntuacion) => a.name.localeCompare(b.name);
  sortSurnames = (a: Puntuacion, b: Puntuacion) =>
    a.surnames.localeCompare(b.surnames);
  sortPoints = (a: Puntuacion, b: Puntuacion) => b.points - a.points;
  sortAbsoluteScore = (a: Puntuacion, b: Puntuacion) =>
    b.points / b.absoluteScore - a.points / a.absoluteScore;
  sortRelativeScore = (a: Puntuacion, b: Puntuacion) =>
    b.points / b.relativeScore - a.points / a.relativeScore;

  resultsByArea() {
    const excludeItems = [];
    Area.query(
      {
        where: { ecoe: this.ecoeId },
        page: 1,
        perPage: 100,
        sort: { $uri: false },
      },
      { paginate: true, cache: false, skip: excludeItems }
    ).then((results) => {
      //results es un Array de objetos
      const areas = results["items"] as Area[];
      let array = [];
      for (const _area of areas) {
        let arearesults = this.api.getResource(
          "ecoes/" + this.ecoeId + "/results-area?area=" + _area.id
        );
        array.push({
          id_area: _area.id,
          nom_area: _area.name,
          results: arearesults,
        });
      }

      const _arrayObs = array.map((_arr) => _arr.results);

      const llamadaszip = zip(..._arrayObs);
      llamadaszip.subscribe(
        (results) => {
          let dataHead = [],
            codeHead = [],
            dataBody = [];
          const dataUsuarios = this.results.sort(
            (a, b) => a.idStudent - b.idStudent
          );

          dataHead[0] = "Total Acierto";
          dataHead[1] = "Total Orden";
          dataHead[2] = "Total Mediana";
          dataHead[3] = "Total Percentil";

          codeHead[0] = "punt_" + "total";
          codeHead[1] = "pos_" + "total";
          codeHead[2] = "med_" + "total";
          codeHead[3] = "perc_" + "total";

          let k = 0;
          for (let i = 0; i < results.length; i++) {
            if (Object.keys(results[i]).length != 0) {
              k++;
              dataHead[k * 4] = array[i].nom_area + " Acierto";
              dataHead[k * 4 + 1] = array[i].nom_area + " Orden";
              dataHead[k * 4 + 2] = array[i].nom_area + " Mediana";
              dataHead[k * 4 + 3] = array[i].nom_area + " Percentil";

              codeHead[k * 4] = "punt_" + array[i].id_area;
              codeHead[k * 4 + 1] = "pos_" + array[i].id_area;
              codeHead[k * 4 + 2] = "med_" + array[i].id_area;
              codeHead[k * 4 + 3] = "perc_" + array[i].id_area;
            }
          }
          /**TODO: Ver de cambiar este totalItems por la longitud de los arrays, ya que si no se quedan 
          varios alumnos fuera de los calculos*/

          var arrayobjetos = [];
          for (let j = 0; j < this.totalItems; j++) {
            k = 0;
            arrayobjetos[j] = {};
            /**Campos estáticos que siempre aparecen en la estructura de los datos */
            arrayobjetos[j][`surnames`] = dataUsuarios[j].surnames;
            arrayobjetos[j][`name`] = dataUsuarios[j].name;
            arrayobjetos[j][`idStudent`] = dataUsuarios[j].idStudent;
            arrayobjetos[j][`dni`] = dataUsuarios[j].dni;

            arrayobjetos[j][`punt_total`] =
              Math.round(
                (this.results[j].points / this.results[j].absoluteScore) * 10000
              ) / 100;
            arrayobjetos[j][`pos_total`] = this.results[j].pos;
            arrayobjetos[j][`med_total`] =
              Math.round(
                (this.results[j].median / this.results[j].absoluteScore) * 10000
              ) / 100;
            arrayobjetos[j][`perc_total`] = this.results[j].perc;

            for (let i = 0; i < results.length; i++) {
              if (Object.keys(results[i]).length != 0) {
                k++;
                arrayobjetos[j][`${codeHead[k * 4]}`] =
                  Math.round(results[i][j].punt * 100) / 100;
                arrayobjetos[j][`${codeHead[k * 4 + 1]}`] = results[i][j].pos;
                arrayobjetos[j][`${codeHead[k * 4 + 2]}`] =
                  Math.round(results[i][j].med * 100) / 100;
                arrayobjetos[j][`${codeHead[k * 4 + 3]}`] = results[i][j].perc;
              }
            }
          }
          //Meter los datos a tablas para usarlos en la creación de una tabla
          this.headerResultsByArea = dataHead;
          this.bodyResultsByArea = arrayobjetos;
          this.bodyResultsByAreaStructure = codeHead;
          this.cargarByArea = false;
        },
        (error) => console.log(error),
        () => {
          return;
        } /**Funcion llamada al acabar el zip() */
      );
    });
  }

  escribirporcentaje(dato) {
    if (dato === undefined) return "";
    else {
      if (dato.includes("med_")) return "%";
      else if (dato.includes("punt_")) return "%";
      else return "";
    }
  }
}
