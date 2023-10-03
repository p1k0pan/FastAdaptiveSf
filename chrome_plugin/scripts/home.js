

//////////////////////////////// GET LOCAL HISTORY /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* TEMPORARY








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


/*
const historyButton = document.getElementById('history-button');
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
} );*/

/*
<body>
    <h2>Recently Typed URLs:</h2>
    <script src="typed-urls.js"></script>
    <div id="typedUrl_div"></div>
</body>
*/







/* TEMPORARY






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

/*
const visitedWebsitesViaPluginButton = document.getElementById( 'visited-button' );
visitedWebsitesViaPluginButton.addEventListener( 'click', () => {
  console.log("visited")

  chrome.storage.sync.get(["visitedWebsites"]).then((result) => {
    console.log("Value currently is " + result.key);

    // Send result.key to server TODO
  });
} );*/







/* TEMPORARY







// TODO probably not necessary
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









*/ // TEMPORARY

//////////////////////////////// GET LOCAL HISTORY /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// currently not used to toggle a dropdown menu
  function toggleDropdown() {
    document.getElementById("myDropdown").classList.toggle("show");
  }
  
  window.addEventListener('click', function(event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  });
  async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

  function sendMessageToContent(action, tabId){
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, {action:action},function (response) {
        if (chrome.runtime.lastError) {
              console.log(chrome.runtime.lastError);
              reject(chrome.runtime.lastError)
            } else {
              resolve(response)
            }
      })
    })
  }

// Switch between uploadHistory home page and highlighting home page
document.addEventListener('DOMContentLoaded', async function(e) {
    // get the important buttons to add click events

    const activateHighlightingButton = document.getElementById('highlight-button');
    const highlightImg = document.getElementById('enable-img');
    const highlightText = document.getElementById('enable-text');
    const msgUser = document.getElementById('msg-user');

    const menu = document.getElementById('menu-button');
    
    var isDisabled = localStorage.getItem("highlight")
    if (isDisabled == null){
      isDisabled = "true"
    }

    // get parse and figure out if it's a medium site
    tabId= await getCurrentTab()
    var content = null
    var isMedium = false
    try{
      var response = await sendMessageToContent("parse", tabId.id)
      if (response.code == 200){
        // console.log("success parse:", response.result)
        content = response.result
        isMedium = true
      }else if (response.code == 400){
        console.log("not a medium site")
        isMedium = false
      }
    } catch(e){
      var msg = "please refresh page first"
      console.log(msg)
      msgUser.style="opacity:1; color: red;"
      msgUser.innerHTML=msg
      isMedium = false
    }

    // initialize with medium site
    if (isMedium){
      // request highlight
      try {
        var highlight_result=null
        highlight_result= await highlightParagraphsContent(e, JSON.stringify(content))
        var res = highlight_result[0]
        var msg = highlight_result[1]
        var data =highlight_result[2]
        if (res==="201" || res==="200"){
            if(isDisabled == "false"){
              changeHighlightStyle(false, highlightImg, highlightText)
              msgUser.style="opacity:1; color: green;"
              chrome.tabs.sendMessage(tabId.id, {action:"highlight",data: data })
            }
            else if (isDisabled == "true"){
              changeHighlightStyle(true, highlightImg, highlightText)
              chrome.tabs.sendMessage(tabId.id, {action:"revert_highlight",data: data })
            }

        }else{msgUser.style="opacity:1; color: red;"}

        msgUser.innerHTML= msg

      } catch(error){
        console.log("Error:", error);
      }
    }
    else{
      changeHighlightStyle(true, highlightImg, highlightText)
      msgUser.style="opacity:1; color: red;"
      msgUser.innerHTML="This is not a medium site"
    }

    //after loading the above code, set loading false and display content and Show the page content
    var loadingElement = document.querySelector('.loading');
    loadingElement.style.display = 'none';
    var spinerElement = document.querySelector('.spiner');
    spinerElement.style.display='none'
    var contentElement = document.getElementById('main-content');
    contentElement.style.display = '';

    //click the button
    if (activateHighlightingButton && isMedium) {
    }else{console.log("is medium is false")}

    activateHighlightingButton.addEventListener('click', async function(e) {
      e.preventDefault();

      if (isMedium){
        try {
          var highlight_result=null
          highlight_result= await highlightParagraphsContent(e, JSON.stringify(content))
          var res = highlight_result[0]
          var msg = highlight_result[1]
          var data =highlight_result[2]
          if (res==="201" || res==="200"){
              if(isDisabled == "false"){
                changeHighlightStyle(true,highlightImg, highlightText)
                msgUser.style="opacity:0;"
                isDisabled="true"
                localStorage.setItem("highlight", isDisabled)
                chrome.tabs.sendMessage(tabId.id, {action:"revert_highlight",data: data })
              }
              else if (isDisabled == "true"){
                changeHighlightStyle(false,highlightImg, highlightText)
                msgUser.style="opacity:1; color: green;"
                isDisabled='false'
                localStorage.setItem("highlight", isDisabled)
                chrome.tabs.sendMessage(tabId.id, {action:"highlight",data: data })
              }
      
          }else{msgUser.style="opacity:1; color: red;"}
    
          msgUser.innerHTML= msg
    
        } catch(error){
          console.log("Error:", error);
        }
      }else{
        changeHighlightStyle(true, highlightImg, highlightText)
        msgUser.style="opacity:1; color: red;"
        msgUser.innerHTML="This is not a medium site"
      }


    });




    const uploadHistoryButton = document.getElementById('historyUpload-button');
    const historyFormSection = document.getElementById('history-form');
    const historyOptionsForm = document.getElementById('historyOptionsForm');
    var isDisplayForm=false

  if (uploadHistoryButton) {
    uploadHistoryButton.addEventListener('click', async function(e) {
      console.log("upload history page")
      e.preventDefault();
      if (!isDisplayForm){
        isDisplayForm=true
        historyFormSection.style.display = 'block';
      }else{
        isDisplayForm=false
        historyFormSection.style.display = 'none';
      }
    });
  }

  // Handle form submission
  historyOptionsForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const timeRange = historyOptionsForm.timeRange.value;
    try {
        const historyUrls = await retrieveHistory(timeRange);
    
        if (historyUrls.length === 0) {
          console.log("No history found for the selected time range.");
        } else {

          // SUCCESS: Patch History
          const username = localStorage.getItem('username');
          const upload_data = {
            "user_name": username,
            "upload_urls": historyUrls
          };
          console.log("Browser History Request (Time Range: " + timeRange + "):", upload_data);
          upload_res= await uploadHistories(e, JSON.stringify(upload_data))
          var res = upload_res[0]
          var msg = upload_res[1]
          var data =upload_res[2]
          if (res==="201" || res==="200"){
            alert("successful uploaded")
            window.location.href = 'home_highlighting.html';
          }else{
            alert("failed to upload")
          }
        }
      } catch (error) {
        console.error("Error retrieving history:", error);
      }
    
    historyFormSection.style.display = 'none';
  });
  });

  async function retrieveHistory(timeRange) {
    return new Promise((resolve, reject) => {
      let startTime;
      switch (timeRange) {
        case 'hour':
          startTime = Date.now() - 3600000; // 1 hour in milliseconds
          break;
        case 'day':
          startTime = Date.now() - 86400000; // 24 hours in milliseconds
          break;
        case 'week':
          startTime = Date.now() - 604800000; // 7 days in milliseconds
          break;
        case '4weeks':
          startTime = Date.now() - 2419200000; // 4 weeks in milliseconds
          break;
        case 'alltime':
          startTime = 0;
          break;
        default:
          startTime = 0;
      }
  
      chrome.history.search({ text: "", startTime }, function (data) {
        if (chrome.runtime.lastError) {
          console.error("Error retrieving history:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          const historyUrls = data.map(page => page.url);
          if (historyUrls.length === 0) {
            console.log("No history found for the selected time range.");
          } else {
            resolve(historyUrls);
          }
        }
      });
    });
  }

// upload a new history
function patchHistory(e, history) {
  e.preventDefault();
  console.log("uploadHistory")
  var res = "0";

  const username = localStorage.getItem('username');
  const access_token = localStorage.getItem('access_token');

  const endpoint = "http://127.0.0.1:8000" + "/" + `user`;
  const method = "PATCH";

  const body = JSON.stringify({
    user_name: username,
    upload_urls: history, // "upload_urls": ["https://www.aljazeera.com/news/2023/4/19/thousands-try-to-flee-sudan-as-truce-fails", ]
  });
  console.log("sending history to backend ...")

  return new Promise(function (resolve, reject) {
    let req = new XMLHttpRequest();
    req.open(method, endpoint, true);
    req.setRequestHeader("Authorization", access_token);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send(body);

    req.onload = function () {
      var data = JSON.parse(req.responseText);

      if(data) {
        res = data.code;
        if (typeof res === 'undefined') {
            res = "0";
          }
        console.log("res: " + String(res));

        if (res === "200" || res === "201") {
          console.log("history uploaded succesfully!");
          var result = data.result;
          // result.user_name replace it
          console.log(result.histories)
        }


        // with refresh token
        if (res === "401") {
            console.log("trying to use the refresh token")
            const refresh_token = localStorage.getItem('refresh_token');

            let req2 = new XMLHttpRequest();
            req2.open(method, endpoint, true);
            req2.setRequestHeader("Authorization", refresh_token);
            req2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            req2.send(body);

            req2.onload = function () {
                var data2 = JSON.parse(req2.responseText);

                if(data2) {
                    res = data2.code;
                    console.log("res: " + String(res));

                    if (res === "200" || res === "201") {
                        console.log("history uploaded succesfully by using the refresh token!");
                        var result = data2.result;
                        console.log(result.histories)
                    }
                }
            }
            req2.onerror = function () {
                console.error("** An error occurred during the XMLHttpRequest for the creation of a new user");
                resolve("0");
          
                reject({
                  status: this.status,
                  statusText: req.statusText,
                });
            };
        }


        // tokens expired or refresh them both again 
        if (res === "402") {
            // logout
            logoutUser(e)
        } else {
            // refresh tokens
            refreshAuthorizationTokens(e)
        } 

        if(res === "400") {
          console.log("No history")
          chrome.runtime.sendMessage( '', {
            type: 'notification',
            message: "You have not uploaded a history yet!"
          });
        }
      }

      resolve(res);
    };

    req.onerror = function () {
      console.error("** An error occurred during the XMLHttpRequest for the creation of a new user");
      resolve("0");

      reject({
        status: this.status,
        statusText: req.statusText,
      });
    };
  });
}

function changeHighlightStyle(isDisabled, highlightImg, highlightText){
  if(!isDisabled){
    highlightImg.src="../assets/icons/enabled_button.svg"
    highlightImg.style="box-shadow: rgba(123, 255, 86, 0.8) 0px 0px 16px, rgba(0, 0, 0, 0.2) 0px 2px 4px inset;"
    highlightText.style.color = "#5ad139"
    highlightText.textContent="Highlight enabled" 
  }else if (isDisabled){
    highlightImg.src="../assets/icons/disabled_button.svg"
    highlightImg.style=""
    highlightText.style.color = "#a3aebc"
    highlightText.textContent="Highlight disabled"
  }
}

function highlightParagraphsContent(e, body) {
    e.preventDefault();
    var res = "0";
  
    const username = localStorage.getItem('username');
    const access_token = localStorage.getItem('access_token');
    const refresh_token = localStorage.getItem('refresh_token');
  
    const endpoint = "http://127.0.0.1:8000" + "/" + `highlight` ;
    const method = "POST";
    console.log("fetching paragraphs to highlight ...")
  
    return new Promise(function (resolve, reject) {
      let req = new XMLHttpRequest();
      req.open(method, endpoint, true);
      req.setRequestHeader("Authorization", access_token);
      req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      req.send(body);
  
      req.onload = function () {
        var data = JSON.parse(req.responseText);
        var msg = "default"
        var result = null
  
        if(data) {
          res = data.code;
          message = data.message;
          if (typeof res === 'undefined') {
            resolve("0")
          }
  
          if (res === "200" || res === "201" ) {
            result = data.result;
            console.log("highlights received succesfully!, result is", result);
            console.log("code is 200 and need inject highlight")
            // after inject
            msg = "Highlight succesfully!"
          } else if (res === "400") {
              console.log("history is empty");
              msg = "history is empty"
             
          }else if (res === "401"){
            token_verify("True", access_token,refresh_token,username, false)
            // if token refresh is failed, it would redirect, following code would not be executed
            console.log("continue work on inject highlight")
            
            msg = "Highlight succesfully!"
          }
          else{
            console.log("error in else")
          }
        }
        resolve([res,msg, result]);
      };
  
      req.onerror = function () {
        console.error("** An error occurred during the XMLHttpRequest for the creation of a new user");
        resolve("0");
  
        reject({
          status: this.status,
          statusText: req.statusText,
        });
      };
    });
  }

// Get highlight paragraphs from the current tab/url
// example:     http://127.0.0.1:8000/highlight?url=www.politico.eu/article/nato-chief-jens-stoltenberg-warns-ukraine-allies-to-prepare-for-long-war/
function highlightUrlContent(e, currentUrl) {
    e.preventDefault();
    var res = "0";
  
    const username = localStorage.getItem('username');
    const access_token = localStorage.getItem('access_token');
    const refresh_token = localStorage.getItem('refresh_token');
  
    const endpoint = "http://127.0.0.1:8000" + "/" + `highlight?url=` + String(currentUrl);
    const method = "GET";
    console.log("fetching paragraphs to highlight ...")
  
    return new Promise(function (resolve, reject) {
      let req = new XMLHttpRequest();
      req.open(method, endpoint, true);
      req.setRequestHeader("Authorization", access_token);
      req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      req.send();
  
      req.onload = function () {
        var data = JSON.parse(req.responseText);
        console.log(data)
        var msg = "default"
  
        if(data) {
          res = data.code;
          message = data.message;
          if (typeof res === 'undefined') {
            res = "0";
          }
  
          if (res === "200" || res === "201" ) {
            console.log("highlights received succesfully!");
            var result = data.result;
            console.log(result)
            console.log("code is 200 and need inject highlight")
            // after inject
            msg = "Highlight succesfully!"
            // msgUser.style="opacity:1; color: green;"
            // msgUser.textContent="Highlight succesfully!"
            // inject code
          } else if (res === "400") {
              console.log("history is empty");
              msg = "history is empty"
              // msgUser.style="opacity:1; color: red;"
              // msgUser.textContent="user history is empty"
          }else if (res === "500") {
              console.log("extract function error");
              msg = "extract function error"
              // msgUser.style="opacity:1; color: red;"
              // msgUser.textContent="extract function error"
          }else if (res === "401"){
            token_verify("True", access_token,refresh_token,username, false)
            // if token refresh is failed, it would redirect, following code would not be executed
            console.log("continue work on inject highlight")
            // after inject
            msg = "Highlight succesfully!"
          }
          else{
            console.log("error in else")
          }
        }
        resolve([res,msg]);
      };
  
      req.onerror = function () {
        console.error("** An error occurred during the XMLHttpRequest for the creation of a new user");
        resolve("0");
  
        reject({
          status: this.status,
          statusText: req.statusText,
        });
      };
    });
  }

  function uploadHistories(e, data) {
    e.preventDefault();
    var res = "0";
  
    const username = localStorage.getItem('username');
    const access_token = localStorage.getItem('access_token');
    const refresh_token = localStorage.getItem('refresh_token');
  
    const endpoint = "http://127.0.0.1:8000" + "/" + `user`;
    const method = "PATCH";
    console.log("patching urls to users ...")
  
    return new Promise(function (resolve, reject) {
      let req = new XMLHttpRequest();
      req.open(method, endpoint, true);
      req.setRequestHeader("Authorization", access_token);
      req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      req.send(data);
  
      req.onload = function () {
        var data = JSON.parse(req.responseText);
        console.log("result is",data)
        var msg = "default"
  
        if(data) {
          res = data.code;
          message = data.message;
          if (typeof res === 'undefined') {
            res = "0";
          }
  
          if (res === "200" || res === "201" ) {
            console.log("upload success");
            var result = data.result;
            console.log(result)
            // after inject
            msg = "upload succesfully!"
            // msgUser.style="opacity:1; color: green;"
            // msgUser.textContent="Highlight succesfully!"
            // inject code
          } else if (res === "400") {
              console.log("no new data");
              msg = "no new data"
              // msgUser.style="opacity:1; color: red;"
              // msgUser.textContent="user history is empty"
          }else if (res === "500") {
              console.log("extract function error");
              msg = "extract function error"
              // msgUser.style="opacity:1; color: red;"
              // msgUser.textContent="extract function error"
          }else if (res === "401"){
            token_verify("True", access_token,refresh_token,username, false)
            // if token refresh is failed, it would redirect, following code would not be executed
            console.log("continue work on uploading")
            // after inject
            uploadHistories(e,data)
            msg = "upload succesfully!"
          }
          else{
            console.log("error in else")
          }
        }
        resolve([res,msg]);
      };
  
      req.onerror = function () {
        console.error("** An error occurred during the XMLHttpRequest for the creation of a new user");
        resolve("0");
  
        reject({
          status: this.status,
          statusText: req.statusText,
        });
      };
    });
  }


// refresh both tokens
  function refreshAuthorizationTokens(e) {
    e.preventDefault();
    var res = "0";
  
    const refresh_token = localStorage.getItem('refresh_token');
    console.log("old refresh token:")
    console.log(refresh_token)
  
  
    const endpoint = "http://127.0.0.1:8000" + "/" + `token_verify?refresh=true`;
    const method = "GET";
  
    return new Promise(function (resolve, reject) {
      let req = new XMLHttpRequest();
      req.open(method, endpoint, true);
      req.setRequestHeader("Authorization", refresh_token);
      req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      req.send();
  
      req.onload = function () {
        var data = JSON.parse(req.responseText);
  
        if(data) {
          res = data.code;
          if (typeof res === 'undefined') {
            res = "0";
          }
          console.log("res: " + String(res));
  
          if (res === "200" || res === "201") {
            var result = data.result;
            
  
            localStorage.removeItem('username');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.setItem('username', result.user_name);
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('refresh_token', result.refresh_token);
  
            const new_username = localStorage.getItem('username');
            const new_access_token = localStorage.getItem('access_token');
            const new_refresh_token = localStorage.getItem('refresh_token');
            console.log("new credentials:")
            console.log(new_username)
            console.log(new_access_token)
            console.log(new_refresh_token)
  
          } else if (res === "400") {
            logoutUser(e)
          }
        } else {
            logoutUser(e)
        }
  
        resolve(res);
      };
  
      req.onerror = function () {
        console.error("** An error occurred during the XMLHttpRequest for the creation of a new user");
        resolve("0");
  
        reject({
          status: this.status,
          statusText: req.statusText,
        });
      };
    });
  
  }
  
  
  
  
  // logout
  function logoutUser(e) {
    e.preventDefault();
    console.log("logout the current user!")
  
    localStorage.removeItem('username');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.clear();
  
    window.location.href = 'login.html';
  }
  
  
