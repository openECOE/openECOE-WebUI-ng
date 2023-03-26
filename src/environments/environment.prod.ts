export const environment = {
  production: true,
  TESTING: false,
  DEBUG: window["env"]["debug"] || false,
  API_ROUTE: window["env"]["apiUrl"] || "default",
  CHRONO_ROUTE: window["env"]["chronoUrl"] || "default",
  BACK_ROUTE: window["env"]["backUrl"] || "default",
};
