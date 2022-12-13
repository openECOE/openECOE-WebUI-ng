import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
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

  rounds: ISummaryItems = { total: 0, show: false, loading: true };
  shifts: ISummaryItems = { total: 0, show: false, loading: true };

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    //this.checkGenerated();
    this.route.params.subscribe((params) => {
      this.ecoeId = params.ecoeId;
    });

    ECOE.fetch<ECOE>(this.ecoeId, { cache: false }).then((value) => {
      this.ecoe = value;
      this.ecoeID = this.ecoe.id;
      this.ecoe_job = this.ecoe.jobReports;
    });

    if (!this.ecoe_job) {
      this.checkGenerated();
    }
  }

  checkGenerated() {
    var completation = setInterval(() => {
      /*this.completion = this.api.getResource(
        "ecoes/" + this.ecoeId + "/results-report"
      )[0].progress;
      console.log();
*/
      this.completion = this.ecoe.jobReports.progress;
      if (this.completion == 100.0) {
        clearInterval(completation);
        this.areGenerated == true;
      }
      return this.completion;
    }, 3000);
  }

  downloadGenerated() {}
}
