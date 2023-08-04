// Login & Register

var usernameLogin = document.getElementById( 'username-login' );
var passwordLogin = document.getElementById( 'password-login' );
const loginButton = document.getElementById( 'login-button' );

loginButton.addEventListener("click", function(e){ // https://stackoverflow.com/questions/56478681/send-post-request-from-chrome-extension
  e.preventDefault();
  console.log("login")

  var res = "0"
  const authorizationData = {
    username: usernameLogin,
    access_token: null,
    refresh_token: null,
  }

  const endpoint = "http://127.0.0.1:8000" + "/" + `login`;
  const body = {
    user_name: usernameLogin,
    password: passwordLogin,
  }

  return new Promise(function (resolve, reject) { // https://stackoverflow.com/questions/48969495/in-javascript-how-do-i-should-i-use-async-await-with-xmlhttprequest
    let req = new XMLHttpRequest();
    req.open("POST", endpoint); // , true);
    //req.setRequestHeader('Authorization', 'Bearer ' + access_token);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send(body); // JSON.stringify(body) TODO

    req.onload = function () {
        res = req.response.data["code"]

        if (this.status >= 200 && this.status < 300) { // 200 or 201
            console.log("user login successful!")
            var result = req.response.data["result"]
            console.log(result["access_token"])
    
            authorizationData["access_token"] = result["access_token"]
            authorizationData["refresh_token"] = result["refresh_token"]

            resolve(req.response);
        } else {
            if(req.response.data["code"] === "400") {
              console.log("user login not successful!")
            
              if(req.response.data["message"] === "Invalid user name or user not found"){
                console.log("Invalid user name or user not found!")
              }
              if(req.response.data["message"] === "Invalid password"){
                console.log("Invalid password!")
              }
            }

            reject({
                status: this.status,
                statusText: req.statusText
            });
        }
    };
    req.onerror = function () {
        reject({
            status: this.status,
            statusText: req.statusText
        });
    };
    req.send();


    // Ways of getting response data / response headers
    req.onreadystatechange = function() { // Call a function when the state changes. TODO
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          console.log("Got response 200!");
          alert(req.responseText);
          console.log(this.responseText);
      }

      if (client.readyState === client.HEADERS_RECEIVED) {
        const contentType = client.getResponseHeader("Content-Type"); // Authorization
      }
    }
});

  
});






const usernameRegister = document.getElementById( 'username-register' );
const passwordRegister = document.getElementById( 'password-register' );
const registerButton = document.getElementById( 'register-button' );
registerButton.addEventListener( 'click', () => {
  console.log("register")
  
} );