# BROWSERSTACK RE-RUN

Re-run Selenium Sessions on BrowserStack using the RAW Logs of a Session

```javascript
const BSRerun = require('/bs-rerun');

BSRerun.runSession({
    "browserName" : "Chrome",
    "browser_version" : "80.0"
  }, "https://link-to-raw-logs");

```