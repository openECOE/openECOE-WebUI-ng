import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-grades",
  templateUrl: "./grades.component.html",
  styleUrls: ["./grades.component.less"],
})
export class GradesComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  onBack() {
    this.router.navigate(["/ecoe/" + this.ecoeId + "/admin"]).finally();
  }
}
