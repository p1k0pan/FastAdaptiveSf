// Test
async function fetchData() {
    const res=await fetch ("https://api.coronavirus.data.gov.uk/v1/data");
    const record=await res.json();
    document.getElementById("date").innerHTML=record.data[0].date;
    document.getElementById("areaName").innerHTML=record.data[0].areaName;
    document.getElementById("latestBy").innerHTML=record.data[0].latestBy;
    document.getElementById("deathNew").innerHTML=record.data[0].deathNew;
}
fetchData();





// Login & Register

const usernameLogin = document.getElementById( 'username-login' );
const passwordLogin = document.getElementById( 'password-login' );
const loginButton = document.getElementById( 'login-button' );
loginButton.addEventListener( 'click', () => {
  console.log("login")
  
} );

const usernameRegister = document.getElementById( 'username-register' );
const passwordRegister = document.getElementById( 'password-register' );
const registerButton = document.getElementById( 'register-button' );
registerButton.addEventListener( 'click', () => {
  console.log("register")
  
} );





// Upload history & visited websites

// Given an array of URLs, build a DOM list of those URLs in the
// browser action popup.                                                          REMOVE TODO
function buildPopupDom(divName, data) {
  let popupDiv = document.getElementById(divName);

  let ul = document.createElement('ul');
  popupDiv.appendChild(ul);

  for (let i = 0, ie = data.length; i < ie; ++i) {
    let a = document.createElement('a');
    a.href = data[i];
    a.appendChild(document.createTextNode(data[i]));
    a.addEventListener('click', onAnchorClick);

    let li = document.createElement('li');
    li.appendChild(a);

    ul.appendChild(li);
  }
}


async function fetchHistory(divName) {
  let resultUrls = []

  // To look for history items visited in the last month,
  // subtract a month of microseconds from the current time.
  let microsecondsPerMonth = 1000 * 60 * 60 * 24 * 7 * 4;
  let oneMonthAgo = new Date().getTime() - microsecondsPerMonth;

  // Track the number of callbacks from chrome.history.getVisits()
  // that we expect to get.  When it reaches zero, we have all results.
  let numRequestsOutstanding = 0;

  chrome.history.search(
    {
      text: '', // Return every history item....
      startTime: oneMonthAgo, // that was accessed less than one week ago.
      maxResults: 1000
    },
    function (historyItems) {
      // For each history item, get details on all visits.
      for (let i = 0; i < historyItems.length; ++i) {
        let url = historyItems[i].url;
        let processVisitsWithUrl = function (url) {
          // We need the url of the visited item to process the visit.
          // Use a closure to bind the  url into the callback's args.
          return function (visitItems) {
            processVisits(url, visitItems);
          };
        };
        chrome.history.getVisits({ url: url }, processVisitsWithUrl(url));
        numRequestsOutstanding++;
      }
      if (!numRequestsOutstanding) {
        resultUrls = onAllVisitsProcessed();
      }
    }
  );

  // Maps URLs to a count of the number of times the user typed that URL into
  // the omnibox.
  let urlToCount = {};

  // Callback for chrome.history.getVisits().  Counts the number of
  // times a user visited a URL by typing the address.
  const processVisits = function (url, visitItems) {
    for (let i = 0, ie = visitItems.length; i < ie; ++i) {
      // Ignore items unless the user typed the URL.
      if (visitItems[i].transition != 'typed') {
        continue;
      }

      if (!urlToCount[url]) {
        urlToCount[url] = 0;
      }

      urlToCount[url]++;
    }

    // If this is the final outstanding call to processVisits(),
    // then we have the final results.  Use them to build the list
    // of URLs to show in the popup.
    if (!--numRequestsOutstanding) {
      resultUrls = onAllVisitsProcessed();
    }
  };

  // This function is called when we have the final list of URls to display.
  const onAllVisitsProcessed = () => {
    // Get the top scorring urls.
    let urlArray = [];
    for (let url in urlToCount) {
      urlArray.push(url);
    }

    // Sort the URLs by the number of times the user typed them.
    urlArray.sort(function (a, b) {
      return urlToCount[b] - urlToCount[a];
    });

    buildPopupDom(divName, urlArray.slice(0, 10));
    return urlArray.slice(0, 100)
  };

  return resultUrls
}


const historyButton = document.getElementById( 'history-button' );
historyButton.addEventListener( 'click', () => {
  console.log("history")

  let resultUrls = []
  document.addEventListener('DOMContentLoaded', function () {
    resultUrls = fetchHistory('typedUrl_div');
  });

  // send resultUrls to server TODO

  chrome.runtime.sendMessage( '', {
    type: 'notification',
    message: "Search history has been sent to our server to provide you with specific interests!"
  });
} );

/*
<body>
    <h2>Recently Typed URLs:</h2>
    <script src="typed-urls.js"></script>
    <div id="typedUrl_div"></div>
</body>
*/




const allowCollection = new Boolean(false);
// Add a website everytime the user visits a new one with the plugin, if it is allowed to collect them
async function addWebsite() {
  let currentUrl = ""
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => { // currentWindow: true
    let url = tabs[0].url;
    currentUrl = url
    // use `url` here inside the callback because it's asynchronous!
  });

  // Where we will expose all the data we retrieve from storage.sync.
  const storageCache = { count: 0, visitedWebsites: [] };
  // Asynchronously retrieve data from storage.sync, then cache it.
  const initStorageCache = chrome.storage.sync.get().then((items) => {
    // Copy the data retrieved from storage into storageCache.
    Object.assign(storageCache, items);
  });


  try {
    await initStorageCache;
  } catch (e) {
    // Handle error that occurred during storage initialization.
  }

  // Normal action handler logic.
  storageCache.count++;
  storageCache.visitedWebsites = storageCache.visitedWebsites.push(currentUrl);
  chrome.storage.sync.set(storageCache);
}


const visitedWebsitesViaPluginButton = document.getElementById( 'visited-button' );
visitedWebsitesViaPluginButton.addEventListener( 'click', () => {
  console.log("visited")

  chrome.storage.sync.get(["visitedWebsites"]).then((result) => {
    console.log("Value currently is " + result.key);

    // Send result.key to server TODO
  });
} );
















var messageRegex = /__MSG_(\w+)__/g;
function localizeHtmlPage (elm) {
  for (var i = 0; i < elm.children.length; i++) {
    localizeHtmlPage(elm.children[i]);
    if (elm.children[i].hasAttributes()) {
      for (var j = 0; j < elm.children[i].attributes.length; j++) {
        elm.children[i].attributes[j].name = elm.children[i].attributes[j].name.replace(messageRegex, localizeString);
        elm.children[i].attributes[j].value = elm.children[i].attributes[j].value.replace(messageRegex, localizeString);
      }
    }
    if (elm.children[i].innerHTML.length) {
      elm.children[i].innerHTML = elm.children[i].innerHTML.replace(messageRegex, localizeString);
    }
  }

}

function localizeString(_, str) {
    return str ? chrome.i18n.getMessage(str) : "";
}

localizeHtmlPage(document.body);