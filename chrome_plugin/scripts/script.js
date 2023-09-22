
let is_refresh= "False"
var access_token = localStorage.getItem('access_token')
var refresh_token = localStorage.getItem('refresh_token')
var username_stored = localStorage.getItem('username')

// window.location.href = "login.html";
// logoutUser(e)
console.log("token_verify")
token_verify( is_refresh, access_token, refresh_token, username_stored, true);
