(function(window) {
  window["env"] = window["env"] || {};
  
  _location = "http://localhost:8080"

  // Environment variables
  window["env"]["debug"] = false;
  window["env"]["backUrl"] = _location;
  window["env"]["apiUrl"] = _location + "/backend";
  window["env"]["chronoUrl"] = _location + "/chrono";
})(this);