import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "@app/services/api/api.service";
import { ECOE, Job, Student, Round, Shift } from "@models/index";
import { Item, Pagination } from "@openecoe/potion-client";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";

interface ISummaryItems {
  total: number;
  show: Boolean;
  loading?: Boolean;
}
@Component({
  selector: "app-ecoe-results",
  templateUrl: "./ecoe-results.component.html",
  styleUrls: ["./ecoe-results.component.less"],
})
export class EcoeResultsComponent implements OnInit, OnDestroy {
  areGeneratedReport: boolean;
  areGeneratedCSV: boolean;
  ecoeId: number;
  completion: number;
  completion_csv: number;
  arrayResource: any;
  ecoe: ECOE;
  ecoeID: number;

  ecoe_job_reports: Job | any;
  job_id_reports: any;
  job_reports_file: string;
  file_name_reports: string;

  ecoe_csv: Job | any;
  job_id_csv: any;
  job_csv_file: string;
  file_name_csv: string;

  progress: number;
  progress_csv: number;

  btn_csv: boolean = true;
  btn_dwl_csv: boolean = false;

  rounds: ISummaryItems = { total: 0, show: false, loading: true };
  shifts: ISummaryItems = { total: 0, show: false, loading: true };
  students: ISummaryItems = { total: 0, show: false, loading: true };
  stages: ISummaryItems = { total: 0, show: false, loading: true };
  ecoeName: any;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.ecoeId = params.ecoeId;
    });

    ECOE.fetch<ECOE>(this.ecoeId).then((value) => {
      this.ecoe = value;
      this.ecoeID = this.ecoe.id;

      this.ecoe_job_reports = this.ecoe.jobReports;
      if (this.ecoe_job_reports) {
        this.job_id_reports = this.ecoe_job_reports.id;
      } else {
        this.ecoe_job_reports = new Job();
        this.ecoe_job_reports.complete = false;
      }

      this.ecoe_csv = this.ecoe.jobCsv;
      if (this.ecoe_csv) this.job_id_csv = this.ecoe_csv.id;
      else {
        this.ecoe_csv = new Job();
        this.ecoe_csv.complete = false;
      }

      this.ecoeName = this.ecoe.name;

      this.getTotalItems(Student).then((cont) => {
        this.students.total = cont;
        this.students.loading = false;
        this.students.show = this.show_students;
      });

      this.getTotalItems(Round).then((cont) => {
        this.rounds.total = cont;
        this.rounds.loading = false;
        this.rounds.show = this.show_planner;
      });

      this.getTotalItems(Shift).then((cont) => {
        this.shifts.total = cont;
        this.shifts.loading = false;
        this.shifts.show = this.show_planner;
      });
      if (this.job_id_reports) this.checkGenerated();
      if (this.ecoe.jobCsv) {
        this.updateProgressCsv(this.ecoe.jobCsv);
      }

      return;
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  onBack() {
    this.router.navigate(["/ecoe"]).finally();
  }

  checkGenerated() {
    Job.fetch<Job>(this.job_id_reports, { cache: false }).then(() => {
      this.progress = this.ecoe_job_reports.progress;
      this.completion = this.progress;
    });

    var completation = setInterval(() => {
      Job.fetch<Job>(this.job_id_reports, { cache: false }).then(() => {
        this.progress = this.ecoe_job_reports.progress;
        if (this.progress == 100.0) {
          clearInterval(completation);
          this.job_reports_file = this.ecoe_job_reports.uri;
          this.areGeneratedReport = true;
          this.file_name_reports = this.ecoe_job_reports.file;
        }
      });
    }, 500);
  }

  downloadGenerated() {
    this.api.getJobFile(this.job_id_reports, this.file_name_reports);
  }

  async generateEcoeData() {
    this.progress_csv = 0;
    this.btn_csv = false;
    this.btn_dwl_csv = false;
    this.ecoe.generateCSV().then((job: Job) => {
      this.job_id_csv = job.id;
      this.ecoe_csv = job;
      this.ecoe_csv.complete = false;
      this.ecoe_csv.file = "ecoe_" + this.ecoeID + ".csv";
      this.updateProgressCsv(job);
    });
  }

  async updateProgressCsv(job: Job) {
    this.ecoe_csv = job;

    this.file_name_csv = this.ecoe_csv.file;

    var completation_csv = setInterval(() => {
      var progress = this.getProgressCsv(job).then((progress) => {
        if (progress == 100) {
          clearInterval(completation_csv);
          this.btn_dwl_csv = true;
        }
      });
    }, 1000);
  }
  downloadCSV() {
    this.api.getJobFile(this.job_id_csv, "csv_" + 'ecoe_' + this.ecoeID);
  }

  get show_students(): boolean {
    return this.stages.total > 0 || this.students.total > 0;
  }

  get show_planner(): boolean {
    return (
      this.stages.total > 0 || this.rounds.total > 0 || this.shifts.total > 0
    );
  }
  async getProgressCsv(job: Job = null): Promise<number> {
    const _job = await Job.fetch<Job>(job.id, { cache: false });
    this.progress_csv = _job.progress;
    if (this.progress_csv == 100.0) {
      this.job_csv_file = this.ecoe_csv.uri;
      this.areGeneratedCSV = true;
      this.btn_csv = true;
      this.btn_dwl_csv = true;
    }
    return _job.progress;
  }
  async getTotalItems<T extends Item>(itemClass: new () => T): Promise<number> {
    const _pag: Pagination<Item> = await (itemClass as unknown as Item).query(
      {
        where: { ecoe: this.ecoe },
        page: 1,
        perPage: 1,
      },
      { paginate: true }
    );

    return _pag.total;
  }
}
