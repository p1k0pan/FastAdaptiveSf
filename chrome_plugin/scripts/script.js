// this file is set as default popup, so everytime click the plugin this script will run,
// which is fit to call token_verify to verify user everytime they click the plugin 



// Init token variables
let is_refresh = "False"
var access_token = localStorage.getItem('access_token')
var refresh_token = localStorage.getItem('refresh_token')
var username_stored = localStorage.getItem('username')

console.log("token_verify")
token_verify(is_refresh, access_token, refresh_token, username_stored, true);


// Switch between uploadHistory home page and highlighting home page
document.addEventListener('DOMContentLoaded', async function (e) {

  // Get the important buttons to add click events for the HISTORY-RELATED functionality
  const uploadHistoryButton = document.getElementById('historyUpload-button');
  const historyFormSection = document.getElementById('history-form');
  const historyOptionsForm = document.getElementById('historyOptionsForm');

  if (uploadHistoryButton) {
    uploadHistoryButton.addEventListener('click', async function (e) {
      console.log("upload history page")
      e.preventDefault();
      historyFormSection.style.display = 'block';
    });
  }

  // Handle form submission
  historyOptionsForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const timeRange = historyOptionsForm.timeRange.value;

    try {
      const historyUrls = await retrieveHistory(timeRange);

      if (historyUrls.length === 0) {
        console.log("No history found for the selected time range.");

      } else {
        // SUCCESS: Patch History
        const username = localStorage.getItem('username');
        const data = {
          "user_name": username,
          "upload_urls": historyUrls
        };
        console.log("Browser History Request (Time Range: " + timeRange + "):", data);
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


