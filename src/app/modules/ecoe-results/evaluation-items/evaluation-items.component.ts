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

// Interface for question data in chart
interface QuestionChartData {
  questionId: number;
  reference: string;
  description: string;
  rate: number;
}

// Interface for station chart
interface StationChart {
  stationName: string;
  stationId: number;
  questions: QuestionChartData[];
  averageRate: number;
}

class itemEval {
  rate: number;
  questionId: number;
  stationId: number;
  maxPoints: number;
  points: number;
  questionSchema: any;
  stationName: string;
  reference?: string;
  description?: string;
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
  stationCharts: StationChart[] = [];

  filter: Object[];
  filterFn: boolean | null;

  loading: boolean;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.loading = true;
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
          this.calculateStationCharts();
          this.loading = false;
        });
      });
    });
  }

  // Calculate chart data grouped by station
  calculateStationCharts(): void {
    if (!this.results || this.results.length === 0) return;

    // Group questions by station
    const stationMap = new Map<string, { stationId: number; questions: QuestionChartData[] }>();

    this.results.forEach(item => {
      const key = item.stationName;
      if (!stationMap.has(key)) {
        stationMap.set(key, { stationId: item.stationId, questions: [] });
      }
      stationMap.get(key).questions.push({
        questionId: item.questionId,
        reference: item.reference || `Q${item.questionId}`,
        description: item.description || '',
        rate: item.rate
      });
    });

    // Convert map to array and sort questions by ID within each station
    this.stationCharts = [];
    stationMap.forEach((data, stationName) => {
      const sortedQuestions = data.questions.sort((a, b) => a.questionId - b.questionId);
      const avgRate = sortedQuestions.reduce((sum, q) => sum + q.rate, 0) / sortedQuestions.length;
      
      this.stationCharts.push({
        stationName,
        stationId: data.stationId,
        questions: sortedQuestions,
        averageRate: Math.round(avgRate * 100) / 100
      });
    });

    // Sort stations by name
    this.stationCharts.sort((a, b) => a.stationName.localeCompare(b.stationName));
  }

  // Get bar height based on success rate (0-100%)
  getBarHeight(rate: number): string {
    const maxHeight = 120; // max bar height in pixels
    const height = Math.max((rate / 100) * maxHeight, 2);
    return `${height}px`;
  }

  // Get bar color based on success rate
  getBarColor(rate: number): string {
    if (rate < 50) return '#ff4d4f';  // Red for low success
    if (rate < 70) return '#faad14';  // Orange for moderate
    if (rate < 85) return '#52c41a';  // Green for good
    return '#1890ff';  // Blue for excellent
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
