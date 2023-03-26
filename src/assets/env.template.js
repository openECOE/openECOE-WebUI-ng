(function(window) {
  window["env"] = window["env"] || {};
  
  _location = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port
  
  // Environment variables
  window["env"]["debug"] = "${DEBUG}";
  window["env"]["backUrl"] = "${BACKEND_URL}" || _location;
  window["env"]["apiUrl"] = "${BACKEND_URL}/backend";
  window["env"]["chronoUrl"] = "${BACKEND_URL}/chrono";
})(this);