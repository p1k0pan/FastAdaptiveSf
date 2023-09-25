function token_verify(is_refresh, access_token, refresh_token, username_stored, redirect=true) {
    const endpoint_root = "http://127.0.0.1:8000/"
    const endpoint_func =  `token_verify?refresh=`
    const method = "GET";
    let req = new XMLHttpRequest();
    req.open(method, endpoint_root+ endpoint_func+is_refresh, true);
    if (is_refresh=="True"){
        req.setRequestHeader("Authorization", refresh_token);
    }else if(is_refresh=="False"){
        req.setRequestHeader("Authorization", access_token);
    }

    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.onload = function () {
        if (req.status >= 200 && req.status < 300) {
            // Request was successful
            var data = JSON.parse(req.responseText);
            var result = data.result
            console.log(data)
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


                detectHistory(redirect)
                // console.log("data code is 200")
                // window.location.href = "home_highlighting.html";
            }
            else if (data.code == "401"){
                // send refresh token instead and set is_refresh true
                is_refresh="True";
                console.log("data code is 401 ");
                token_verify( is_refresh,access_token, refresh_token, username_stored, redirect)
            }
            else if (data.code == "402"){
                // print the error message to user
                var log = "token expired";
                console.log("data code is ", data.code);
                console.log("data msg is ", data.message);
                alert(log)
                window.location.href = "login.html";
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

function detectHistory(redirect) {
    console.log("check if the user already uploaded a history at one point; if a history is present")
    var historyPresent = false;
    var res ="0"

    const username = localStorage.getItem('username');
    const access_token = localStorage.getItem('access_token');
    const refresh_token = localStorage.getItem('refresh_token');

    const endpoint = "http://127.0.0.1:8000" + "/" + `user/history?user_name=` + String(username);
    const method = "GET";


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
        console.log(data);

        if (res === "200" || res === "201") {
            console.log("history for this user is present!");
            historyPresent = true

            var result = data.result;

        } else if (res === "400") {
            console.log("not a valid json file")
            historyPresent = false

        } else if (res === "404") {
            console.log("history does not exist")
            historyPresent = false
        }
        // with refresh token
        else if (res === "401") {
            console.log("401")
            token_verify("True", access_token, refresh_token, username)
        }
        // tokens expired or refresh them both again 
        else{
            // logout
            logoutUser()
        }     
    }

    // redirect
    if (historyPresent) {
        console.log("history present")
        if (redirect){
            window.location.href = 'home_highlighting.html';
        }

    } else {
        console.log("No history present")
        // window.location.href = 'home_uploadHistory.html';
    }
    };
}
function logoutUser() {
  
    localStorage.removeItem('username');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.clear();
  
    window.location.href = 'login.html';
}