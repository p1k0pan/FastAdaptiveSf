// Login & Register

window.addEventListener("DOMContentLoaded", (e) => {
  const loginButton = document.getElementById("login-button");

  if (loginButton) {
    var usernameLogin = document.getElementById("username-login");
    var passwordLogin = document.getElementById("password-login");

    const body = JSON.stringify({
      user_name: String(usernameLogin),
      password: String(passwordLogin),
    });

    loginButton.addEventListener('click', function (e) {
      login(e, body); // Pass the event object 'e' to the 'login' function
    }, false);
  }
});



function login(e, body) {
  e.preventDefault();
  console.log("login");

  var res = "0";
  const username = body["user_name"]

  const authorizationData = {
    username: String(username),
    access_token: null,
    refresh_token: null,
  };

    const endpoint = "http://127.0.0.1:8000" + "/" + `login`;
    const method = "POST";
    console.log(String(username));

    return new Promise(function (resolve, reject) {
      let req = new XMLHttpRequest();
      req.open(method, endpoint, true);
      req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      req.send(body);

      req.onload = function () {
      var data = JSON.parse(req.responseText);

      if (data) {
        res = data.code;
        console.log("res: " + String(res));

        if (res === "200" || res === "201") {
          console.log("user login successful!");
          var result = data.result;
          console.log(result.access_token);

          authorizationData.access_token = result.access_token;
          authorizationData.refresh_token = result.refresh_token;

          resolve(res); // req.response
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

          resolve("400");
          reject({
            status: this.status,
            statusText: req.statusText,
          });
        }
        }
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
  const registerButton = document.getElementById( 'register-button' );
  if (registerButton) {
    registerButton.addEventListener('click', function (e) {
      register(e); // Pass the event object 'e' to the 'register' function
    }, false);
  }
});


async function register(e) {
  const usernameRegister = document.getElementById( 'username-register' );
  const passwordRegister = document.getElementById( 'password-register' );

  const body = JSON.stringify({
    user_name: String(usernameRegister),
    password: String(passwordRegister),
  });


  try {
    const res = await createUser(e, body);
    
    if(res === "200" || res === "201"){
    await login(e, body);
    } else {
      console.log("could not log in: there was an error during registration!")
    }

  } catch (error) {
    console.error(error);
  }
}


function createUser(e, body) {
  e.preventDefault();
  console.log("register")

  var res = "0";
  const username = body["user_name"]
  const password = body["password"]

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
        console.log("res: " + String(res));

        if (res === "200" || res === "201") {
          console.log("user created successfully!");
        } 
      }
    };

    req.onerror = function () {
      console.error("** An error occurred during the XMLHttpRequest for the creation of a new user");
      resolve(res);

      reject({
        status: this.status,
        statusText: req.statusText,
      });
    };

    resolve(res);
  });
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


