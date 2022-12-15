import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "@app/services/api/api.service";
import { ECOE, Job } from "@models/index";

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
export class EcoeResultsComponent implements OnInit {
  areGenerated: any;
  ecoeId: number;
  completion: number;
  arrayResource: any;
  ecoe: ECOE;
  ecoeID: number;
  ecoe_job: Job;
  job_id: any;
  progress: number;
  job_reports_file: string;
  file_name: string;

  rounds: ISummaryItems = { total: 0, show: false, loading: true };
  shifts: ISummaryItems = { total: 0, show: false, loading: true };

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    //this.checkGenerated();
    this.route.params.subscribe((params) => {
      this.ecoeId = params.ecoeId;
    });

    ECOE.fetch<ECOE>(this.ecoeId, { cache: false }).then((value) => {
      this.ecoe = value;
      this.ecoeID = this.ecoe.id;
      this.ecoe_job = this.ecoe.jobReports;
      this.job_id = this.ecoe_job.id;
      this.checkGenerated();
      return;
    });
  }
  onBack() {
    this.router.navigate(["/ecoe"]).finally();
  }

  checkGenerated() {
    Job.fetch<Job>(this.job_id, { cache: false }).then((value) => {
      this.progress = this.ecoe_job.progress;
      this.completion = this.progress;
      this.file_name = this.ecoe_job.file;
    });
    var completation = setInterval(() => {
      /*this.completion = this.api.getResource(
          "ecoes/" + this.ecoeId + "/results-report"
        )[0].progress;
        console.log();
  */
      Job.fetch<Job>(this.job_id, { cache: false }).then((value) => {
        this.progress = this.ecoe_job.progress;
        this.completion = this.progress;
        if (this.completion == 100.0) {
          clearInterval(completation);
          this.job_reports_file = this.ecoe_job.uri;
          this.areGenerated == true;
        }
        console.log(this.completion);
      });
    }, 3000);
  }

  downloadGenerated() {
    this.api.getJobFile(this.job_id, this.file_name);
  }
}
