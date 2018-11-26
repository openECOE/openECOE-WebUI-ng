import { Injectable } from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiUrl: string = 'api';
  ecoesSubject: Subject<any[]> = new Subject<any[]>();

  constructor(private http: HttpClient) {

  }

  // TODO: eliminar estos metodos y utilziar los getResources()
  loadEcoe(id: number): Observable<any> {
    return this.getResource(`/${this.apiUrl}/ecoe/${id}`);
  }

  getEcoes() {
    return this.ecoesSubject;
  }

  // TODO: cargar ecoes de la organizacion del usuario que ha iniciado sesion
  setEcoes() {
    this.getResources('ecoe').subscribe(ecoes => this.ecoesSubject.next(ecoes));
  }

  getResources(resource: string, requestParams?: {}): Observable<any[]> {
    const url = `${environment.API_ROUTE}/${this.apiUrl}/${resource}`;
    const params: HttpParams = new HttpParams({fromObject: requestParams});

    return this.http.get<any[]>(url, {
      params
    })
      .pipe(map(response => {
        return response.map(data => {
          const id = this.getIdFromRef(data['$uri']);
          return {id, ...data};
        });
      }));
  }

  getResource(ref: string): Observable<any> {
    return this.http.get<any>(environment.API_ROUTE + ref)
      .pipe(map(response => {
        const itemId = this.getIdFromRef(response['$uri']);
        return {id: itemId, ...response};
      }));
  }

  getResourcesArray(references: Array<{ '$ref': string }>): Observable<any[]> {
    const observablesArray = [];
    references.forEach(ref => {
      observablesArray.push(this.getResource(ref['$ref']));
    });

    return forkJoin(observablesArray);
  }

  createResource(resource: string, body: any): Observable<any> {
    return this.http.post(`${environment.API_ROUTE}/${this.apiUrl}/${resource}`, body)
      .pipe(map(response => {
        const reference = response['$uri'] || response['$ref'];
        const itemId = this.getIdFromRef(reference);
        return {id: itemId, ...response};
      }));
  }

  deleteResource(ref: string, body?: any): Observable<any> {
    if (body) {
      return this.http.request('delete', environment.API_ROUTE + ref, {body: body});
    }

    return this.http.delete(environment.API_ROUTE + ref);
  }

  updateResource(ref: string, body: any): Observable<any> {
    return this.http.patch(environment.API_ROUTE + ref, body)
      .pipe(map(response => {
        const itemId = this.getIdFromRef(response['$uri']);
        return {id: itemId, ...response};
      }));
  }

  getIdFromRef(ref: string): number {
    return +ref.substr(ref.lastIndexOf('/') + 1);
  }
}
