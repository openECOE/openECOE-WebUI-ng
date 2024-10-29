import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./modules/ecoe/home/home.component";
import { LoginComponent } from "@components/login/login.component";
import { AuthenticationGuard } from "./guards/authentication/authentication.guard";
import { EcoeResultsComponent } from "./modules/ecoe-results/ecoe-results.component";
import { GenerateReportsComponent } from "./modules/ecoe-results/generate-reports/generate-reports.component";
import { GradesComponent } from "./modules/ecoe-results/grades/grades.component";
import { EvaluationItemsComponent } from "./modules/ecoe-results/evaluation-items/evaluation-items.component";

const routes: Routes = [
  { path: "", redirectTo: "ecoe", pathMatch: "full" },
  { path: "login", component: LoginComponent, data: { breadcrumb: "Login" } },
  {
    path: "ecoe",
    component: HomeComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: "ecoe/:ecoeId/admin",
    loadChildren: () =>
      import("./modules/ecoe-admin/ecoe-admin.module").then(
        (m) => m.EcoeAdminModule
      ),
    canActivate: [AuthenticationGuard],
  },
  {
    path: "ecoe/:ecoeId/eval",
    loadChildren: () =>
      import("./modules/evaluation/evaluation.module").then(
        (m) => m.EvaluationModule
      ),
    canActivate: [AuthenticationGuard],
  },
  {
    path: "ecoe/:ecoeId/chrono",
    loadChildren: () =>
      import("./modules/chrono-admin/chrono-admin.module").then(
        (m) => m.ChronoAdminModule
      ),
    canActivate: [AuthenticationGuard],
  },
  {
    path: "ecoe/:ecoeId/results",
    component: EcoeResultsComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: "ecoe/:ecoeId/results/generate-reports",
    component: GenerateReportsComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: "ecoe/:ecoeId/results/grades",
    component: GradesComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: "ecoe/:ecoeId/results/evaluation-items",
    component: EvaluationItemsComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: "outside",
    loadChildren: () =>
      import("./modules/outside/outside.module").then((m) => m.OutsideModule),
  },
  {
    path: "control-panel",
    loadChildren: () =>
      import("./modules/control-panel/control-panel.module").then(
        (m) => m.ControlPanelModule
      ),
    canActivate: [AuthenticationGuard],
  },
  { path: "**", redirectTo: "ecoe" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
