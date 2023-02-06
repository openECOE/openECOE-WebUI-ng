import { elementEventFullName } from "@angular/compiler/src/view_compiler/view_compiler";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ECOE } from "@app/models";
import {
  NzTableFilterFn,
  NzTableFilterList,
  NzTableSortFn,
  NzTableSortOrder,
} from "ng-zorro-antd/table";

class itemEval {
  acierto?: number;
  idQuestion?: number;
  idStation?: number;
  maxPoints: number;
  points: number;
  questionSchema?: any;
  stationName?: string;
}

@Component({
  selector: "app-evaluation-items",
  templateUrl: "./evaluation-items.component.html",
  styleUrls: ["./evaluation-items.component.less"],
})
export class EvaluationItemsComponent implements OnInit {
  ecoeId: number;
  ecoe: ECOE;
  ecoe_name: string;

  results: itemEval[];

  filter: Object[];
  filterFn: boolean | null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.ecoeId = +params.ecoeId;
      ECOE.fetch<ECOE>(this.ecoeId, { cache: false }).then((value) => {
        this.ecoe = value;
        this.ecoe_name = value.name;
        this.ecoe.itemscore().then((response: itemEval[]) => {
          const filter = [];
          response.forEach((pregunta, index) => {
            response[index] = {
              ...response[index],
              ...JSON.parse(pregunta.questionSchema),
            };
            const obj = {
              text: response[index].stationName,
              value: response[index].stationName,
            };
            //TODO:: Ver que falla aqui y arreglarlo
            if (filter.length == 0) filter.push(obj);
            if (
              filter.every(function (currentElement, index, array) {
                return EvaluationItemsComponent.isFilterEqual(
                  currentElement,
                  obj
                );
              })
            )
              filter.push(obj);
          });
          this.filter = filter;
          this.results = response;
        });
      });
    });
  }

  /**Filter used to determine which rows appear in the table in function of the return value of this function */
  filterStationName = (listIndexNames: string[], item: itemEval) =>
    listIndexNames.some(
      (stationName) => item.stationName.indexOf(stationName) !== -1
    );

  static isFilterEqual(object1, object2) {
    if (object1.name === object2.name)
      return !(object1.value === object2.value);
    else return true;
  }

  /**
   * Fired on page changed, will change the data to display.
   */
  pageChange() {
    //TODO:: Esto habrá que adaptarlo cuando se ponga paginación en backend
    //this.loadAreas();
  }
  /**
   * When per page is changed this method will fired.
   * Will be reset the current page and loads again the areas
   * @param pageSize new value per page.
   */
  pageSizeChange(tabla: string, newpageSize: number) {
    this[tabla] = newpageSize;
    //TODO:: Esto habrá que adaptarlo
    this.resetCurrentPage(tabla);
    //this.loadAreas();
  }
  /**
   * Resets current page to first (1)
   */
  resetCurrentPage(tabla) {
    this[tabla] = 1;
  }

  onBack() {
    this.router.navigate(["/ecoe/" + this.ecoeId + "/results"]).finally();
  }
}
