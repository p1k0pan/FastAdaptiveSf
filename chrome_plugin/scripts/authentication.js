// Login & Register

window.addEventListener("DOMContentLoaded", (e) => {
  const loginButton = document.getElementById("login-button");

  if (loginButton) {
    loginButton.addEventListener('click', function (e) {

      const usernameLogin = document.getElementById("username-login").value;
      const passwordLogin = document.getElementById("password-login").value;
  
      const body = JSON.stringify({
        user_name: String(usernameLogin),
        password: String(passwordLogin),
      });

      login(e, body, usernameLogin); // Pass the event object 'e' to the 'login' function
    }, false);
  }
});





async function login(e, body, username) {
  e.preventDefault();
  console.log("login");

  var res = "0";

  const endpoint = "http://127.0.0.1:8000" + "/" + `login`;
  const method = "POST";

    return new Promise(function (resolve, reject) {
      let req = new XMLHttpRequest();
      req.open(method, endpoint, true);
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
          console.log("user login successful!");
          var result = data.result;

          localStorage.setItem('username', String(username));
          localStorage.setItem('access_token', result.access_token);
          localStorage.setItem('refresh_token', result.refresh_token);
          
          try {
            userHasHistory(e);

          } catch (error) {
            console.error(error);
          }

        } else {
          if (res === "400") {
            var message = data.message;
            console.log("user login not successful!");

            if (message === "Invalid user name or user not found") {
              console.log("Invalid user name or user not found!");
            }
            if (message === "Invalid password") {
              console.log("Invalid password!");
            }
          }
        }
      }

      resolve(res)
      };

      req.onerror = function () {
        console.error("** An error occurred during the XMLHttpRequest for the login");
        resolve("0");

        reject({
          status: this.status,
          statusText: req.statusText,
        });
      };
    });
}








window.addEventListener("DOMContentLoaded", (e) => {
  const registerButton = document.getElementById('register-button');

  if (registerButton) {
    registerButton.addEventListener('click', function (e) { // submit

      const usernameRegister = document.getElementById("username-register").value;
      const passwordRegister = document.getElementById("password-register").value;

      register(e, usernameRegister, passwordRegister); // Pass the event object 'e' to the 'register' function
    }, false);
  }
});


async function register(e, username, password) {
  e.preventDefault();
  console.log("register")

  const body = JSON.stringify({
    user_name: String(username),
    password: String(password),
  });


  try {
    const res = await createUser(e, body);
    console.log("res after registration:")
    console.log(res)
    
    if(res === "200" || res === "201"){
    await login(e, body, username);
    } else if (res === "400") {
      console.log("user already exists! proceeding to log in with the existing user ...")
      await login(e, body, username);
    }
    else {
      console.log("could not log in: there was an error during registration!")
    }

  } catch (error) {
    console.error(error);
  }
}


function createUser(e, body) {
  e.preventDefault();
  console.log("createUser")
  var res = "0";

  const endpoint = "http://127.0.0.1:8000" + "/" + `user`;
  const method = "POST";

  return new Promise(function (resolve, reject) {
    let req = new XMLHttpRequest();
    req.open(method, endpoint, true);
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
          console.log("user created successfully!");
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







function userHasHistory(e) {
  e.preventDefault();
  console.log("check if the user already uploaded a history at one point; if a history is present")
  var res = "0";
  var historyPresent = false;

  const username = localStorage.getItem('username');
  const access_token = localStorage.getItem('access_token');
  const refresh_token = localStorage.getItem('refresh_token');
  console.log(username)
  console.log(access_token)
  console.log(refresh_token)

  const endpoint = "http://127.0.0.1:8000" + "/" + `user/history?user_name=` + String(username);
  const method = "GET";

  
  return new Promise(function (resolve, reject) {
    let req = new XMLHttpRequest();
    req.open(method, endpoint, true);
    req.setRequestHeader("Authorization", access_token);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send();

    req.onload = async function () {
      var data = JSON.parse(req.responseText);

      if(data) {
        res = data.code;
        if (typeof res === 'undefined') {
          res = "0";
        }
        console.log("res: " + String(res));

        if (res === "200" || res === "201") {
          console.log("history for this user is present!");
          historyPresent = true

          var result = data.result;
          console.log(result)

        } else if (res === "400") {
          console.log("not a valid json file")
          historyPresent = false

        } else if (res === "404") {
          console.log("history does not exist")
          historyPresent = false
        }


        // with refresh token
        if (res === "401") {
            console.log("trying to use the refresh token")
            let req2 = new XMLHttpRequest();
            req2.open(method, endpoint, true);
            req2.setRequestHeader("Authorization", refresh_token);
            req2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            req2.send();

            req2.onload = function () {
                var data2 = JSON.parse(req2.responseText);

                if(data2) {
                    res = data2.code;
                    console.log("res: " + String(res));

                    if (res === "200" || res === "201") {
                      console.log("history for this user is present!");
                      historyPresent = true

                      var result = data.result;
                      console.log(result)
          
                    } else if (res === "400") {
                      console.log("not a valid json file")
                      historyPresent = false

                    } else if (res === "404") {
                      console.log("history does not exist")
                      historyPresent = false
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
            await refreshAuthorizationTokens(e)
        } 
      }


      // redirect
      if (historyPresent) {
        console.log("history present")
        window.location.href = 'home_highlighting.html';

      } else {
        console.log("No history present")
        window.location.href = 'home_uploadHistory.html';
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







function refreshAuthorizationTokens(e) {
  e.preventDefault();
  var res = "0";

  const refresh_token = localStorage.getItem('refresh_token');
  console.log("old refresh token:")
  console.log(refresh_token)


  const endpoint = "http://127.0.0.1:8000" + "/" + `token_verify?refresh=True`;
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
          localStorage.clear();

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
          print("")
          console.log(result.refresh_token)

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





function logoutUser(e) {
  e.preventDefault();
  console.log("logout the current user!")

  localStorage.removeItem('username');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.clear();

  window.location.href = 'login.html';
}






// Switch between register.html and login.html
document.addEventListener('DOMContentLoaded', function() {
  const redirectToLoginLink = document.querySelector("#toLogin-link");
  const redirectToRegisterLink = document.querySelector("#toRegister-link");
  
  if (redirectToLoginLink) {
    redirectToLoginLink.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'login.html';
    });
  }

  if (redirectToRegisterLink) {
    redirectToRegisterLink.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'register.html';
      // Redirect the user to the "register.html" page
      // chrome.tabs.create({ url: "register.html" });
    });
  }
});









