//



// Currently not used to toggle a dropdown menu
function toggleDropdown() {
  document.getElementById("myDropdown").classList.toggle("show");
}


//
window.addEventListener('click', function (event) {
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


//
async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);

  return tab;
}


//
function sendMessageToContent(action, tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { action: action }, function (response) {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        reject(chrome.runtime.lastError)
      } else {
        resolve(response)
      }
    })
  })
}


// Switch between the upload history home page and the highlighting home page depending on what is being rendered & handle their logic
document.addEventListener('DOMContentLoaded', async function (e) {

  // Get the important buttons to add click events for the HIGHLIGHTING
  const activateHighlightingButton = document.getElementById('highlight-button');
  const highlightImg = document.getElementById('enable-img');
  const highlightText = document.getElementById('enable-text');
  const msgUser = document.getElementById('msg-user');

  const menu = document.getElementById('menu-button');

  var isDisabled = localStorage.getItem("highlight")
  if (isDisabled == null) {
    isDisabled = "true"
  }

  // get parse and figure out if it's a medium site
  tabId = await getCurrentTab()
  var content = null
  var isMedium = false

  try {
    var response = await sendMessageToContent("parse", tabId.id)

    if (response.code == 200) {
      content = response.result
      isMedium = true

    } else if (response.code == 400) {
      console.log("not a medium site")
      isMedium = false
    }

  } catch (e) {
    var msg = "please refresh page first"
    console.log(msg)

    msgUser.style = "opacity:1; color: red;"
    msgUser.innerHTML = msg
    isMedium = false
  }

  // initialize with medium site
  if (isMedium) {
    // request highlights
    try {
      var highlight_result = null
      highlight_result = await highlightParagraphsContent(e, JSON.stringify(content))

      var res = highlight_result[0]
      var msg = highlight_result[1]
      var data = highlight_result[2]

      if (res === "201" || res === "200") {
        if (isDisabled == "false") {
          changeHighlightStyle(false, highlightImg, highlightText)
          msgUser.style = "opacity:1; color: green;"
          chrome.tabs.sendMessage(tabId.id, { action: "highlight", data: data })
        }

        else if (isDisabled == "true") {
          changeHighlightStyle(true, highlightImg, highlightText)
          chrome.tabs.sendMessage(tabId.id, { action: "revert_highlight", data: data })
        }

      } else { msgUser.style = "opacity:1; color: red;" }

      msgUser.innerHTML = msg

    } catch (error) {
      console.log("Error:", error);
    }
  }

  else {
    changeHighlightStyle(true, highlightImg, highlightText)
    msgUser.style = "opacity:1; color: red;"
    msgUser.innerHTML = "This is not a medium site"
  }

  //after loading the above code, set loading false and display content and Show the page content
  var loadingElement = document.querySelector('.loading');
  loadingElement.style.display = 'none';

  var spinerElement = document.querySelector('.spiner');
  spinerElement.style.display = 'none'

  var contentElement = document.getElementById('main-content');
  contentElement.style.display = '';

  //click the button
  if (activateHighlightingButton && isMedium) {

  } else { 
    console.log("is medium is false") 
  }


  // Handle highlight button click
  activateHighlightingButton.addEventListener('click', async function (e) {
    e.preventDefault();

    if (isMedium) {
      try {
        var highlight_result = null
        highlight_result = await highlightParagraphsContent(e, JSON.stringify(content))

        var res = highlight_result[0]
        var msg = highlight_result[1]
        var data = highlight_result[2]

        if (res === "201" || res === "200") {
          if (isDisabled == "false") {
            changeHighlightStyle(true, highlightImg, highlightText)
            msgUser.style = "opacity:0;"
            isDisabled = "true"
            localStorage.setItem("highlight", isDisabled)
            chrome.tabs.sendMessage(tabId.id, { action: "revert_highlight", data: data })
          }

          else if (isDisabled == "true") {
            changeHighlightStyle(false, highlightImg, highlightText)
            msgUser.style = "opacity:1; color: green;"
            isDisabled = 'false'
            localStorage.setItem("highlight", isDisabled)
            chrome.tabs.sendMessage(tabId.id, { action: "highlight", data: data })
          }

        } else { 
          msgUser.style = "opacity:1; color: red;" 
        }

        msgUser.innerHTML = msg

      } catch (error) {
        console.log("Error:", error);
      }

    } else {
      changeHighlightStyle(true, highlightImg, highlightText)
      msgUser.style = "opacity:1; color: red;"
      msgUser.innerHTML = "This is not a medium site"

    }

  });


  // -------------- Switch from handling logic regarding the highlighting to logic regarding the upload of browser histories
  

  // Get the important buttons to add click events for the HISTORY-RELATED functionality
  const uploadHistoryButton = document.getElementById('historyUpload-button');
  const historyFormSection = document.getElementById('history-form');
  const historyOptionsForm = document.getElementById('historyOptionsForm');
  var isDisplayForm = false

  if (uploadHistoryButton) {
    uploadHistoryButton.addEventListener('click', async function (e) {
      console.log("upload history page")
      e.preventDefault();

      if (!isDisplayForm) {
        isDisplayForm = true
        historyFormSection.style.display = 'block';

      } else {
        isDisplayForm = false
        historyFormSection.style.display = 'none';

      }
    });
  }

  // Handle history form submission
  historyOptionsForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const timeRange = historyOptionsForm.timeRange.value;

    try {
      const historyUrls = await retrieveHistory(timeRange);

      if (historyUrls.length === 0) {
        console.log("No history found for the selected time range.");

      } else {
        // SUCCESS: Patch the history
        const username = localStorage.getItem('username');
        const upload_data = {
          "user_name": username,
          "upload_urls": historyUrls
        };

        console.log("Browser History Request (Time Range: " + timeRange + "):", upload_data);
        upload_res = await uploadHistories(e, JSON.stringify(upload_data))

        var res = upload_res[0]
        var msg = upload_res[1]
        var data = upload_res[2]

        if (res === "201" || res === "200") {
          alert("successful uploaded")
          window.location.href = 'home_highlighting.html';

        } else {
          alert("failed to upload")

        }
      }

    } catch (error) {
      console.error("Error retrieving history:", error);
    }

    historyFormSection.style.display = 'none';
  });
});


// 
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


// Upload a new history to the backend
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
    upload_urls: history, // example: "upload_urls": ["https://www.aljazeera.com/news/2023/4/19/thousands-try-to-flee-sudan-as-truce-fails", ]
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

      if (data) {
        res = data.code;
        if (typeof res === 'undefined') {
          res = "0";
        }
        console.log("res: " + String(res));

        if (res === "200" || res === "201") {
          console.log("history uploaded succesfully!");
          var result = data.result;
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

            if (data2) {
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

        if (res === "400") {
          console.log("No history")
          chrome.runtime.sendMessage('', {
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


// 
function changeHighlightStyle(isDisabled, highlightImg, highlightText) {
  if (!isDisabled) {
    highlightImg.src = "../assets/icons/enabled_button.svg"
    highlightImg.style = "box-shadow: rgba(123, 255, 86, 0.8) 0px 0px 16px, rgba(0, 0, 0, 0.2) 0px 2px 4px inset;"
    highlightText.style.color = "#5ad139"
    highlightText.textContent = "Highlight enabled"

  } else if (isDisabled) {
    highlightImg.src = "../assets/icons/disabled_button.svg"
    highlightImg.style = ""
    highlightText.style.color = "#a3aebc"
    highlightText.textContent = "Highlight disabled"
  }
}


// 
function highlightParagraphsContent(e, body) {
  e.preventDefault();
  var res = "0";

  const username = localStorage.getItem('username');
  const access_token = localStorage.getItem('access_token');
  const refresh_token = localStorage.getItem('refresh_token');

  const endpoint = "http://127.0.0.1:8000" + "/" + `highlight`;
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

      if (data) {
        res = data.code;
        message = data.message;

        if (typeof res === 'undefined') {
          resolve("0")
        }

        if (res === "200" || res === "201") {
          result = data.result;
          console.log("highlights received succesfully!, result is", result);
          console.log("code is 200 and need inject highlight")
          msg = "Highlight succesfully!"

        } else if (res === "400") {
          console.log("history is empty");
          msg = "history is empty"

        } else if (res === "401") {
          token_verify("True", access_token, refresh_token, username, false)
          console.log("continue work on inject highlight")
          msg = "Highlight succesfully!"

        }

        else {
          console.log("error in else")
        }
      }
      resolve([res, msg, result]);
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

      if (data) {
        res = data.code;
        message = data.message;

        if (typeof res === 'undefined') {
          res = "0";
        }

        if (res === "200" || res === "201") {
          console.log("highlights received succesfully!");
          var result = data.result;
          console.log(result)
          console.log("code is 200 and need inject highlight")
          msg = "Highlight succesfully!"

        } else if (res === "400") {
          console.log("history is empty");
          msg = "history is empty"

        } else if (res === "500") {
          console.log("extract function error");
          msg = "extract function error"
        } else if (res === "401") {
          token_verify("True", access_token, refresh_token, username, false)
          console.log("continue work on inject highlight")
          msg = "Highlight succesfully!"

        }

        else {
          console.log("error in else")
        }
      }
      resolve([res, msg]);
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


// 
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
      console.log("result is", data)
      var msg = "default"

      if (data) {
        res = data.code;
        message = data.message;

        if (typeof res === 'undefined') {
          res = "0";
        }

        if (res === "200" || res === "201") {
          console.log("upload success");
          var result = data.result;
          console.log(result)
          msg = "upload succesfully!"

        } else if (res === "400") {
          console.log("no new data");
          msg = "no new data"

        } else if (res === "500") {
          console.log("extract function error");
          msg = "extract function error"

        } else if (res === "401") {
          token_verify("True", access_token, refresh_token, username, false)
          console.log("continue work on uploading")
          uploadHistories(e, data)
          msg = "upload succesfully!"

        }

        else {
          console.log("error in else")
        }
      }
      resolve([res, msg]);
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


// Refresh the authorization tokens
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

      if (data) {
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



// User logout functionality
function logoutUser(e) {
  e.preventDefault();
  console.log("logout the current user!")

  localStorage.removeItem('username');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.clear();

  window.location.href = 'login.html';
}


