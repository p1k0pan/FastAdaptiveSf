// This file is set as a default popup script, so everytime the plugin is clicked this script will run,
// which is able to call token_verify to verify user everytime they click the plugin 



// Init token variables
let is_refresh = "False"
var access_token = localStorage.getItem('access_token')
var refresh_token = localStorage.getItem('refresh_token')
var username_stored = localStorage.getItem('username')

console.log("token_verify")
token_verify(is_refresh, access_token, refresh_token, username_stored, true);


