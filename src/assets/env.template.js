(function(window) {
  window["env"] = window["env"] || {};

  // Environment variables
  window["env"]["debug"] = "${DEBUG}";
  window["env"]["secretKey"] = "${SECRET_KEY}";
  window["env"]["apiUrl"] = "${API_URL}";
  window["env"]["chronoUrl"] = "${CHRONO_ROUTE}";
})(this);