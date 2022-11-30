import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {map} from 'rxjs/operators';
import {Role, User, Option} from '@app/models';

/**
 * Service with the HTTP requests to the backend.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  /**
  * Constant with the 'api' path.
  */
  apiUrl: string = 'api/v1';

  constructor(private http: HttpClient) {}

  removeAnswer(studentId: number, option: Option) {
    const url = `${environment.API_ROUTE}/${this.apiUrl}/students/${studentId}/answers/${option.id}`;
    const options = {
      headers: new HttpHeaders()
    };
    return this.http.delete(url, options);
  }

  getRolesTypes() {
    const RolesPath = 'roles/types';
    const url = `${environment.API_ROUTE}/${this.apiUrl}/${RolesPath}`;

    return this.http.get(url)
      .pipe(
        map((roles: Role[]) => {
          roles.forEach(role => {
            role.name = role.name.toUpperCase();
          });

          return roles;
        })
      );
  }

  getUsersWithRoles(queryParams) {
    return User.query(queryParams, {paginate: true})
      .then((page: any) => {
        page.items.forEach(async (item: User) => {
          const auxRoles = Array.from(await item.roles());
          item.roleNames = [...auxRoles.map(role => role['name'])];
        });
        return page;
      })
      .catch(err => err);
  }

  addUserRole(role: string, userID: number) {

    const _role = new Role({
      name: role,
      user: userID
    });

    return _role.save();
  }


  deleteUserRole(role: Role) {
    return role.destroy();
  }

  /**
   * Makes a HTTP GET request to the backend and gets a list of items.
   *
   * @param resource Name of the resource
   * @param requestParams? Optional params object
   * @returns Observable<any[]> The array of items of the requested resource
   */
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

  /**
   * Makes a HTTP GET request to the backend and gets an item.
   *
   * @param ref Reference path of the resource
   * @returns Observable<any> The object of the reference passed
   */
  getResource(ref: string): Observable<any> {
    return this.http.get<any>(environment.API_ROUTE + ref)
      .pipe(map(response => {
        const itemId = this.getIdFromRef(response['$uri']);
        return {id: itemId, ...response};
      }));
  }

  /**
   * Makes a HTTP POST request to the backend.
   *
   * @param resource Name of the resource
   * @param body Object with the elements of the resource
   * @returns Observable<any> The object of the item created
   */
  createResource(resource: string, body: any): Observable<any> {
    return this.http.post(`${environment.API_ROUTE}/${this.apiUrl}/${resource}`, body)
      .pipe(map(response => {
        const reference = response['$uri'] || response['$ref'];
        const itemId = this.getIdFromRef(reference);
        return {id: itemId, ...response};
      }));
  }

  /**
   * Gets the id of the reference passed.
   *
   * @param ref Reference path of the resource
   * @returns The id obtained
   */
  getIdFromRef(ref: string): number {
    return +ref.substr(ref.lastIndexOf('/') + 1);
  }
}
