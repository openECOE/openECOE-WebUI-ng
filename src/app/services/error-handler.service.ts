import { ErrorHandler, Injectable, NgZone } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { NzNotificationService } from "ng-zorro-antd/notification";

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  constructor(
    private notification: NzNotificationService,
    private ngZone: NgZone,
    private translate: TranslateService
  ) {}

  handleError(error: any): void {
    // Usamos NgZone para asegurarnos de que Angular detecte los cambios en la UI
    this.ngZone.run(() => {
      const title = this.translate.instant("ERROR_REQUEST_CONTENT");

      const msg = error.message || error.toString();

      // Mostrar una notificación de error en la UI
      this.notification.error(title, msg);

      // Imprimir el error en la consola para facilitar la depuración
      console.error("Error no controlado:", error);
    });
  }
}
