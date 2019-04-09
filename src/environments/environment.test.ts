// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  SERVER_NAME: 'test.openecoe.umh.es',
  SECRET_KEY: 'f24b05095b4748a8b9d13df5cdb8d83c',
  DEBUG: true,
  TESTING: false,
  API_ROUTE: 'http://test.api.openecoe.umh.es',
  API_AUTH_TOKEN: 'http://test.api.openecoe.umh.es/auth/tokens',
  CHRONO_ROUTE: 'http://test.chrono.openecoe.umh.es:6080'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
