import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { catchError, map, tap } from "rxjs/operators";
import { Role, User, Option, ECOE, Station, Area } from "@app/models";
import { ApiPermissions } from "@app/models";

/**
 * Service with the HTTP requests to the backend.
 */
@Injectable({
  providedIn: "root",
})
export class ApiService {
  /**
   * Constant with the 'api' path.
   */
  apiUrl: string = "api/v1";

  constructor(private http: HttpClient) {}

  removeAnswer(studentId: number, option: Option) {
    const url = `${environment.API_ROUTE}/${this.apiUrl}/students/${studentId}/answers/${option.id}`;
    const options = {
      headers: new HttpHeaders(),
    };
    return this.http.delete(url, options);
  }

  getRolesTypes() {
    const RolesPath = "roles/types";
    const url = `${environment.API_ROUTE}/${this.apiUrl}/${RolesPath}`;

    return this.http.get(url).pipe(
      map((roles: Role[]) => {
        roles.forEach((role) => {
          role.name = role.name.toUpperCase();
        });

        return roles;
      })
    );
  }

  getUsersWithRoles(queryParams) {
    return User.query(queryParams, { paginate: true })
      .then((page: any) => {
        page.items.forEach(async (item: User) => {
          const auxRoles = Array.from(await item.roles());
          item.roleNames = [...auxRoles.map((role) => role["name"])];
        });
        return page;
      })
      .catch((err) => err);
  }

  addUserRole(role: string, userID: number) {
    const _role = new Role({
      name: role,
      user: userID,
    });

    return _role.save();
  }

  deleteUserRole(role: Role) {
    return role.destroy();
  }

  addPermision(user: User, name: string, idObject: number | string, object: string): Promise<ApiPermissions> {

    // TODO: asegurar que name y object son strings permitidos

    const permission = new ApiPermissions({
      user,
      name,
      idObject,
      object
    });

    return permission.save();
  }

  async getPermissionForStation(user: User, station: Station): Promise<ApiPermissions | null> {
    try {
      const permission = await ApiPermissions.first<ApiPermissions>({
        where: {
          user: user,
          object: "stations",
          idObject: station.id
        }
      });
      return permission;
    } catch (error) {
      console.error("Error al obtener el permiso para la estación:", error);
      return null;
    }
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
    const params: HttpParams = new HttpParams({ fromObject: requestParams });

    return this.http
      .get<any[]>(url, {
        params,
      })
      .pipe(
        map((response) => {
          if (response != null)
            return response.map((data) => {
              if (typeof data["$uri"] != "undefined") {
                const id = this.getIdFromRef(data["$uri"]);
                return { id, ...data };
              }
              return;
            });
        })
      );
  }

  /**
   * Makes a HTTP GET request to the backend and gets an item.
   *
   * @param ref Reference path of the resource
   * @returns Observable<any> The object of the reference passed
   */

  getResource(ref: string, requestParams?: {}): Observable<any> {
    const url = `${environment.API_ROUTE}/${this.apiUrl}/${ref}`;

    const params: HttpParams = new HttpParams({ fromObject: requestParams });

    return this.http
      .get<any>(url, {
        params,
      })
      .pipe(
        map((response) => {
          if (typeof response != undefined) return { ...response };
        })
      );
  }

  /**
   * Makes a HTTP POST request to the backend and gets an item.
   *
   * @param ref Reference path of the resource
   * @param body Body of the resource
   * @returns Observable<any> The object of the reference passed
   */
  postResource(ref: string, body?: any, requestParams?: {}): Observable<any> {
    const url = `${environment.API_ROUTE}/${this.apiUrl}/${ref}`;
    const params: HttpParams = new HttpParams({ fromObject: requestParams });

    return this.http
      .post<any>(url, body, {
        params,
      })
      .pipe(
        map((response) => {
          if (typeof response != undefined) return { ...response };
        })
      );
  }

  getResourceFile(ref: string): Observable<any> {
    const url = `${environment.API_ROUTE}/${this.apiUrl}/${ref}`;
    const _options = {
      observe: "body",
      responseType: "arraybuffer",
    };
    return this.http
      .get(url, { observe: "response", responseType: "arraybuffer" })
      .pipe(
        map((response) => {
          return response.body;
        })
      );
  }

  /**
   * Makes a HTTP GET request to retrive a file generated by a job and downloads it
   *
   * @param ref Id of the job
   * @param filename Name given to the downloaded file
   */
  getJobFile(ref: string, filename: string) {
    const url = `${environment.API_ROUTE}/${this.apiUrl}/jobs/${ref}/download`;
    this.http
      .get(url, { observe: "response", responseType: "blob" as "json" })
      .subscribe((response: any) => {
        let blob: Blob = response.body;
        let downloadLink = document.createElement("a");
        downloadLink.href = window.URL.createObjectURL(blob);
        if (filename) downloadLink.setAttribute("download", filename);
        document.body.appendChild(downloadLink);
        downloadLink.click();
      });
  }

  /**
   * Makes a HTTP POST request to the backend.
   *
   * @param resource Name of the resource
   * @param body Object with the elements of the resource
   * @returns Observable<any> The object of the item created
   */
  createResource(resource: string, body: any): Observable<any> {
    return this.http
      .post(`${environment.API_ROUTE}/${this.apiUrl}/${resource}`, body)
      .pipe(
        map((response) => {
          const reference = response["$uri"] || response["$ref"];
          const itemId = this.getIdFromRef(reference);
          return { id: itemId, ...response };
        })
      );
  }

  /**
   * Gets the id of the reference passed.
   *
   * @param ref Reference path of the resource
   * @returns The id obtained
   */
  getIdFromRef(ref: string): number {
    return +ref.substr(ref.lastIndexOf("/") + 1);
  }

  getServerStatus(): Observable<string> {
    const url = `${environment.API_ROUTE}/status/`;

    return this.http.get(url, { responseType: 'text' as const})
      .pipe(
        catchError(() => of('ko'))
      );
  }

  async getEvaluators(ecoe: ECOE): Promise<User[]> {
    let permissions = await ApiPermissions.query<ApiPermissions>({
      where: {
        name: "evaluate",
        object: "stations"
      },
      perPage: 100
    }, {paginate: true});

    let permissionsOfThisEcoe = [];
    for (const permission of permissions) {
      let station = await Station.fetch<Station>(permission.idObject);
      if(station.ecoe.id == ecoe.id) {
        permissionsOfThisEcoe.push(permission);
      }
    }

    return [...new Set(permissionsOfThisEcoe.map(p => p.user))];
  }

  async getStationsByEvaluator(user: User, ecoe: ECOE): Promise<Station[]> {
    let permissions = await ApiPermissions.query<ApiPermissions>({
      where: {
        name: "evaluate",
        object: "stations",
        user: user,
      }
    });

    let stations: Station[] = [];
    for(const permission of permissions) {
      let station = await Station.fetch<Station>(permission.idObject);
      if(station.ecoe.id == ecoe.id) {
        stations.push(station);
      }
    }

    return stations;
  }

  async getAreasByEcoe(ecoe: ECOE): Promise<Area[]> {
    let areas = await Area.query<Area>({
      where: {
        ecoe: ecoe.id
      }
    });

    return areas;
  }

  cloneEcoe(ecoe: ECOE){
    const url = `${environment.API_ROUTE}/${this.apiUrl}/ecoe/${ecoe.id}/clone`;
    return this.http.post(url, ecoe);
  }

  importEcoeJSON(ecoe: ECOE){
    const url = `${environment.API_ROUTE}/${this.apiUrl}/ecoe/${ecoe.id}/import`;
    return this.http.post(url, ecoe);
  }

  cloneStations(ecoe: ECOE, stationsID: any[]){
    const url = `${environment.API_ROUTE}/${this.apiUrl}/ecoes/${ecoe.id}/stations/clone`;
    return this.http.post(url, {"stations": stationsID});
  }
}
