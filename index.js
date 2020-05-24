const request = require('sync-request');
const BSHub = require('./bs-hub');

// download raw logs
function downloadRawLogs(url) {
  var res = request("GET", url, {});
  return res.getBody('utf8');
}


// analyze raw logs
function getSessionDetails(url) {
  
  // Prep Logs
  var rawLogs = downloadRawLogs(url);
  var lineBreak = "\r\n" + rawLogs.substr(0,4);
  var lines = rawLogs.split(lineBreak);
  
  // init variables
  var requests = [];
  var responces = [];
  var elements = {};
  var windows = {};
  
  // get request method endpoint and body
  // and get responce body
  lines.forEach((line, i) => {
    // Remove create session requests and responces
    if([0,1,2,3].includes(i)) return;
    
    // Prep line
    line = line.split(" ");
    
    // Requests
    if(line[2] == "REQUEST") {
      var method = line[5];
      var endpoint = "/" + line[6].split("/").slice(3).join("/");
      var data = JSON.parse(line.slice(7).join(" "));
      if(data == "") data = '{}';
      
      requests.push({
        method: method,
        endpoint: endpoint,
        data: data
      });
    }
    
    // Responces
    else if(line[2] == "RESPONSE") {
      responces.push(JSON.parse(line.slice(3).join(" ")).value);
    }
  });
  
  
  // update
  requests.forEach((req, i) => {
    if(req.endpoint == '/element') {
      elements[Object.values(responces[i])[0]] = [i, null];
    }
    
    else if(req.endpoint == '/elements') {
      Object.values(responces[i]).forEach((elmID, j) => {
        elements[elmID] = [i, j];
      });
    }
    
    else if(req.endpoint.includes('/element/')) {
      if(req.endpoint.includes("/active")) return;
      var elmID = req.endpoint.split('/')[2];
      requests[i].update = elements[elmID];
      requests[i].update.unshift(elmID);
    }
    
    
    
    else if(req.endpoint == '/window_handle') {
      windows[responces[i]] = [i, null];
    }
    
    else if(req.endpoint == '/window_handles') {
      responces[i].forEach((windowsHandle, j) => {
        windows[windowsHandle] = [i, j];
      });
    }
    
    else if(req.endpoint == '/window' && req.method == 'POST') {
      var windowsHandle = req.data.name;
      requests[i].update = windows[windowsHandle];
      requests[i].update.unshift(windowsHandle);
    }
    
    else if(req.endpoint.includes('/window/')) {
      var windowsHandle = req.endpoint.split('/')[2];
      requests[i].update = windows[windowsHandle];
      requests[i].update.unshift(windowsHandle);
    }
  });
  
  return requests;
}

function updateEndpoint(endpoint, base, elmid) {
  return endpoint.replace(base, elmid);
}

function runSession(capabilities, url) {
  var responces = [];
  var ogRequests = getSessionDetails(url);
  BSHub.startSession(capabilities);
  console.log(BSHub.getSessionLink());
  ogRequests.forEach(req => {
    if(req.hasOwnProperty('update')) {
      if(req.endpoint.includes('/element/')) {
        if(req.update[2] == null) {
          // update element id form /element
          req.endpoint = updateEndpoint(req.endpoint, req.update[0], Object.values(responces[req.update[1]])[0]);
        } else {
          // update element id form /elements
          req.endpoint = updateEndpoint(req.endpoint, req.update[0], Object.values(responces[req.update[1]])[req.update[2]]);
        }
      }
      else if(req.endpoint.includes('/window/')) {
        if(req.update[2] == null) {
          // update windowsHandle id form /window
          req.endpoint = updateEndpoint(req.endpoint, req.update[0], responces[req.update[1]]);
        } else {
          // update windowsHandle id form /windows
          req.endpoint = updateEndpoint(req.endpoint, req.update[0], responces[req.update[1]][req.update[2]]);
        }
      }
      else if(req.endpoint == '/window' && req.method == 'POST') {
        if(req.update[2] == null) {
          // update windowsHandle id form /window
          req.data.name = responces[req.update[1]];
        } else {
          // update windowsHandle id form /windows
          req.data.name = responces[req.update[1]][req.update[2]];
        }
      }
    }
    responces.push(JSON.parse(BSHub.sessionCommand(req.method, req.endpoint, req.data).getBody('utf8')).value);
  });
  BSHub.stopSession();
;}


// export module
module.exports.runSession = runSession;