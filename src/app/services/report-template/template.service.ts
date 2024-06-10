import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Template } from '@app/models/template';
import { environment } from "../../../environments/environment";
import { Observable } from 'rxjs';
import { ECOE } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  constructor(private http: HttpClient) {}
  apiUrl: string = "api/v1";

  async createTemplate(ecoe: ECOE, htmlString: string): Promise<Template> {
    const existingTemplate = await this.getTemplate(ecoe);
    if (existingTemplate) {
      console.log("Template existente", existingTemplate);
      await this.deleteTemplate(existingTemplate);
    }
    const url = `${environment.API_ROUTE}/${this.apiUrl}/templates`;
    const templateData = {
      ecoe: ecoe.id,
      html: htmlString
    };
    return this.http.post<Template>(url, templateData).toPromise();
  }

  async getTemplate(ecoe: ECOE): Promise<Template | null> {
    try{
      const template = await Template.first<Template>({ 
        where: { 
          ecoe: ecoe.id 
        },
      });
      return template;
    }
    catch(err){
      console.error(err);
      return null;
    }
  }

  async deleteTemplate(template: Template): Promise<void> {
    console.log("Template a borrar", template);
    const url = `${environment.API_ROUTE}/${this.apiUrl}/templates/${template.id}`;
    console.log("URL de borrar", url);
    await this.http.delete(url).toPromise();
  }
}
