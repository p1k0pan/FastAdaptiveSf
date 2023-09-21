console.log("start");
// var name = localStorage.getItem(String(result.username))
// localStorage.removeItem('access_token')
// localStorage.removeItem('refresh_token')
// localStorage.removeItem('username')
// localStorage.clear();
var access_token = localStorage.getItem('access_token')
var refresh_token = localStorage.getItem('refresh_token')
var username_stored = localStorage.getItem('username')

let is_refresh= "False"

const endpoint_root = "http://127.0.0.1:8000/"
const endpoint_func =  `token_verify?refresh=`
const method = "GET";
console.log(access_token)
console.log(refresh_token)
async function token_verify(is_refresh, token) {

    let req = new XMLHttpRequest();
    req.open(method, endpoint_root+ endpoint_func+is_refresh, true);

    req.setRequestHeader("Authorization", token);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.onload = function () {
        if (req.status >= 200 && req.status < 300) {
            // Request was successful
            var data = JSON.parse(req.responseText);
            var result = data.result
            // {"code":"400","status":"Failed","message":"Signature verification failed. Token has expired. Login agian","result":null}
            if (data.code == "200" || data.code == "201")
            {
                // verify the user is the same
                var username_token= result.user_name
                if (username_stored != username_token)
                {
                    var log = "user name is not the same";
                    console.log(log);
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    localStorage.removeItem('username')
                    localStorage.clear();
                    alert(log);
                    window.location.href = "login.html";
                    // finish
                }
                if(data.code == "201"){
                    // delete the old one and store the new one
                    console.log("data code is 201")
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    localStorage.removeItem('username')
                    localStorage.clear();
                    localStorage.setItem('username', String(result.user_name));
                    localStorage.setItem('access_token', result.access_token);
                    localStorage.setItem('refresh_token', result.refresh_token);

                }
                // window.location.href = "home_highlighting.html";
            }
            else if (data.code == "401"){
                // send refresh token instead and set is_refresh true
                is_refresh="True";
                console.log("data code is 401 ");
                token_verify(is_refresh, refresh_token)
            }
            else if (data.code == "402"){
                // print the error message to user
                var log = "token expired";
                console.log(log);
                console.log("data code is ", data.code);
                console.log("data msg is ", data.message);
                window.location.href = "login.html";
                alert(log)
            }
            else{
                console.log("data code is ", data.code);
                console.log("data msg is ", data.message);
                window.location.href = "login.html";
            }

        }

        else {
            // Request failed
            console.error('Request failed with status:', req.status);
        }
    };
    req.send();
}

// window.location.href = "login.html";
token_verify(is_refresh, access_token);


console.log("end");
