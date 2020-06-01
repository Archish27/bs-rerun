# BrowserStack ReRun
This library re-runs sessions on BrowserStack by parsing Raw Logs

# Install
Create project folder
```
mkdir rerun
cd rerun
```

Initialize npm and install bs-rerun 
```
npm init -y
npm i bs-rerun
```

Set environment variables
```
export BROWSERSTACK_USERNAME=<browserstack-username>
export BROWSERSTACK_ACCESS_KEY=<browserstack-access-key>
```

# Using BS RERUN
Create a js file `example.js` with the contents:
```javascript
const BSRerun = require('bs-rerun');

// BSRerun.runSession(capabilities, link-for-raw-logs);
BSRerun.runSession({
    "browserName" : "Chrome",
    "browser_version" : "80.0"
  }, "http://link-to-raw-logs");
  
// Above Raw Log URL is for session created on June 1st 2020

```

(Re)Run the session
```
node example.js
```