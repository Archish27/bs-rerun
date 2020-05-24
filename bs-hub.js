const request = require('sync-request');

var HUB = "http://hub-cloud.browserstack.com/wd/hub";
var session;

// Base  quest function
function sendRequest(method, url, body) {
  return request(method, url, {
    json: body,
    headers : {
      "Authorization" : "Basic " + new Buffer.from(process.env.BROWSERSTACK_USERNAME + ":" + process.env.BROWSERSTACK_ACCESS_KEY).toString("base64")
    }
  });
}

// Start Session
function startSession(capabilities) {
  var res = sendRequest("POST", HUB + "/session", {
    desiredCapabilities: capabilities
  });
  
  var body = JSON.parse(res.getBody('utf8'))
  
  session = body.sessionId;
  
  return res;
}

// Stop Session
function stopSession() {
  var res = sessionCommand("DELETE", "", {});
  
  session = null;
  
  return res;
}

// Session Command
function sessionCommand(method, endpoint, body) {
  return sendRequest(method, HUB + "/session/" + session + endpoint, body);
}

// Get Session Link
function getSessionLink() {
  return "https://automate.browserstack.com/dashboard/v2/sessions/" + session;
}

// Module exports
module.exports.sendRequest = sendRequest;
module.exports.startSession = startSession;
module.exports.stopSession = stopSession;
module.exports.sessionCommand = sessionCommand;
module.exports.getSessionLink = getSessionLink;
