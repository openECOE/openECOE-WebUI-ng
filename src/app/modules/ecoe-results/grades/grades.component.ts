import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Area, ECOE } from "../../../models";
import { ApiService } from "@app/services/api/api.service";
import { NzTableSortFn, NzTableSortOrder } from "ng-zorro-antd/table";
import { zip } from "rxjs";

// Chart data interfaces
interface GradeDistribution {
  range: string;
  count: number;
  percentage: number;
}

interface AreaDistribution {
  areaName: string;
  average: number;
  median: number;
  min: number;
  max: number;
  distribution: GradeDistribution[];
}

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
  maxPoints?: number;
  notaFinal?: number;  // Potion converts nota_final to notaFinal

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

  // Chart data
  totalGradeDistribution: GradeDistribution[] = [];
  areaDistributions: AreaDistribution[] = [];
  totalStats = { average: 0, median: 0, min: 0, max: 0, stdDev: 0 };
  gradeRanges = ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10'];

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('GradesComponent ngOnInit started');
    this.route.params.subscribe((params) => {
      console.log('Route params:', params);
      this.ecoeId = +params.ecoeId;

      ECOE.fetch<ECOE>(this.ecoeId, { cache: false }).then((value) => {
        console.log('ECOE fetched:', value);
        this.ecoe = value;
        this.ecoe_name = this.ecoe.name;

        const excludeItems = [];

        this.ecoe.results().then((response: Puntuacion[]) => {
          console.log('API Response:', response);
          console.log('First result keys:', response.length > 0 ? Object.keys(response[0]) : 'no data');
          console.log('First result notaFinal:', response.length > 0 ? response[0].notaFinal : 'no data');
          console.log('First result absoluteScore:', response.length > 0 ? response[0].absoluteScore : 'no data');
          this.results = response.sort((a, b) => b.points - a.points);
          this.totalItems = response.length;
          this.calculateTotalGradeDistribution();
          this.resultsByArea();
        }).catch(err => console.error('Error fetching results:', err));
      }).catch(err => console.error('Error fetching ECOE:', err));
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
  sortNotaFinal = (a: Puntuacion, b: Puntuacion) =>
    (b.notaFinal || 0) - (a.notaFinal || 0);

  resultsByArea() {
    this.cargarByArea = true;
    console.log('resultsByArea() iniciando, ecoeId:', this.ecoeId);
    
    // Usamos el endpoint results-areas que devuelve todos los datos de una vez
    this.api.getResource(`ecoes/${this.ecoeId}/results-areas`).subscribe(
      (response: any) => {
        console.log('results-areas response:', response);
        console.log('Is Array:', Array.isArray(response));
        
        // Si la respuesta es un objeto (por el spread de getResource), convertirlo a array
        let resultsAreas: any[];
        if (Array.isArray(response)) {
          resultsAreas = response;
        } else if (response && typeof response === 'object') {
          // Convertir objeto con índices numéricos a array
          resultsAreas = Object.values(response);
        } else {
          resultsAreas = [];
        }
        
        console.log('resultsAreas length:', resultsAreas.length);
        
        if (!resultsAreas || resultsAreas.length === 0) {
          console.log('No hay datos de results-areas');
          this.cargarByArea = false;
          return;
        }

        // Obtener nombres de áreas del primer registro
        const areaNames: string[] = [];
        const firstResult = resultsAreas[0];
        if (firstResult && firstResult.areas) {
          Object.keys(firstResult.areas).forEach(name => areaNames.push(name));
        }

        // Crear headers y estructura
        let dataHead = [];
        let codeHead = [];

        // Añadir columnas de Nota Final ponderada primero
        dataHead[0] = "Nota Final";
        codeHead[0] = "nota_final";

        // Añadir una sola columna por área: mostraremos 'puntos / máximo' en cada celda
        areaNames.forEach((areaName, idx) => {
          const baseIdx = idx + 1; // después de nota final
          dataHead[baseIdx] = `${areaName}`;
          codeHead[baseIdx] = `area_${areaName}`;
        });

        // Crear mapa de id_student a datos de área (convertir a entero por si viene como float)
        const areaDataMap = new Map<number, any>();
        resultsAreas.forEach(r => {
          areaDataMap.set(Math.round(r.id_student), r);
        });

        // Construir datos del cuerpo de la tabla
        const dataUsuarios = this.results.sort((a, b) => (a.idStudent || 0) - (b.idStudent || 0));
        const arrayobjetos = [];

        for (let j = 0; j < dataUsuarios.length; j++) {
          const student = dataUsuarios[j];
          const studentAreaData = areaDataMap.get(student.idStudent);

          const row: any = {
            surnames: student.surnames,
            name: student.name,
            idStudent: student.idStudent,
            dni: student.dni,
            nota_final: studentAreaData ? Math.round(studentAreaData.nota_global * 10) / 10 : 0
          };

          // Añadir dato por área: mostrará 'puntos / max_points'
          if (studentAreaData && studentAreaData.areas) {
            areaNames.forEach(areaName => {
              const areaInfo = studentAreaData.areas[areaName];
              if (areaInfo) {
                const pts = Math.round((areaInfo.points || 0) * 100) / 100;
                const max = Math.round((areaInfo.max_points || 0) * 100) / 100;
                row[`area_${areaName}`] = `${pts} / ${max}`;
              } else {
                row[`area_${areaName}`] = `0 / 0`;
              }
            });
          }

          arrayobjetos.push(row);
        }

        this.headerResultsByArea = dataHead;
        this.bodyResultsByArea = arrayobjetos;
        this.bodyResultsByAreaStructure = codeHead;
        
        // Calculate area distributions for charts
        console.log('Calling calculateAreaDistributions with', resultsAreas.length, 'results and', areaNames.length, 'areas');
        this.calculateAreaDistributions(resultsAreas, areaNames);
        console.log('Area distributions calculated:', this.areaDistributions);
        
        this.cargarByArea = false;
      },
      (error) => {
        console.error('Error loading results by area:', error);
        this.cargarByArea = false;
      }
    );
  }

  escribirporcentaje(dato) {
    return "";
  }

  // Calculate grade distribution for total results
  calculateTotalGradeDistribution(): void {
    if (!this.results || this.results.length === 0) return;

    // Calculate grades on 0-10 scale (notaFinal is 0-100, convert to 0-10)
    const grades = this.results.map(r => (r.notaFinal || 0) / 10);
    
    // Calculate statistics
    const sum = grades.reduce((a, b) => a + b, 0);
    this.totalStats.average = Math.round((sum / grades.length) * 100) / 100;
    
    const sorted = [...grades].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    this.totalStats.median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    this.totalStats.median = Math.round(this.totalStats.median * 100) / 100;
    
    this.totalStats.min = Math.round(Math.min(...grades) * 100) / 100;
    this.totalStats.max = Math.round(Math.max(...grades) * 100) / 100;
    
    // Standard deviation
    const sqDiffs = grades.map(g => Math.pow(g - this.totalStats.average, 2));
    this.totalStats.stdDev = Math.round(Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / grades.length) * 100) / 100;

    // Calculate distribution by grade ranges
    this.totalGradeDistribution = this.gradeRanges.map(range => {
      const [min, max] = range.split('-').map(Number);
      const count = grades.filter(g => g >= min && g < max).length;
      // Handle edge case for 9-10 to include 10
      const actualCount = range === '9-10' ? grades.filter(g => g >= min && g <= max).length : count;
      return {
        range,
        count: actualCount,
        percentage: Math.round((actualCount / grades.length) * 100)
      };
    });
  }

  // Calculate distributions for each area
  calculateAreaDistributions(resultsAreas: any[], areaNames: string[]): void {
    this.areaDistributions = [];

    areaNames.forEach(areaName => {
      const areaGrades: number[] = [];
      
      resultsAreas.forEach(r => {
        if (r.areas && r.areas[areaName]) {
          const areaInfo = r.areas[areaName];
          // Calculate grade as percentage (punt is 0-100, convert to 0-10)
          const grade = (areaInfo.punt || 0) / 10;
          areaGrades.push(grade);
        }
      });

      if (areaGrades.length === 0) return;

      // Calculate statistics for this area
      const sum = areaGrades.reduce((a, b) => a + b, 0);
      const average = Math.round((sum / areaGrades.length) * 100) / 100;
      
      const sorted = [...areaGrades].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

      // Calculate distribution
      const distribution = this.gradeRanges.map(range => {
        const [min, max] = range.split('-').map(Number);
        const count = areaGrades.filter(g => g >= min && g < max).length;
        const actualCount = range === '9-10' ? areaGrades.filter(g => g >= min && g <= max).length : count;
        return {
          range,
          count: actualCount,
          percentage: Math.round((actualCount / areaGrades.length) * 100)
        };
      });

      this.areaDistributions.push({
        areaName,
        average,
        median: Math.round(median * 100) / 100,
        min: Math.round(Math.min(...areaGrades) * 100) / 100,
        max: Math.round(Math.max(...areaGrades) * 100) / 100,
        distribution
      });
    });
  }

  getBarHeight(percentage: number): string {
    // Use percentage for main chart (height 200px container)
    return `${Math.max(percentage, 2)}%`;
  }

  getMiniBarHeight(percentage: number): string {
    // Use pixels for mini charts (80px container height)
    const maxHeight = 70; // max bar height in pixels
    const height = Math.max((percentage / 100) * maxHeight, 2);
    return `${height}px`;
  }

  getBarColor(range: string): string {
    const min = parseInt(range.split('-')[0]);
    if (min < 5) return '#ff4d4f';  // Red for failing grades
    if (min < 7) return '#faad14';  // Orange for passing
    if (min < 9) return '#52c41a';  // Green for good
    return '#1890ff';  // Blue for excellent
  }
}
