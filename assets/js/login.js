const { event } = require("jquery");

/**
 * Add listeners of the input fiels.
 * The enter button will now work to accept the input.
 */
var input_username = document.getElementById("username");
input_username.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        document.getElementById("login_button").click();
    }
});

var input_password = document.getElementById("password");
input_password.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        document.getElementById("login_button").click();
    }
});

var input_id = document.getElementById("idnumber");
input_id.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        document.getElementById("login_button").click();
    }
});

/**
 * Attempts to log a user in.
 * Reads the input field of username, password and idnumber as login info.
 * 
 * @return  Sends the login info to main
 */
function login() {

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let idnumber = document.getElementById("idnumber").value;

    let hash_password = sha256(password);

    ipcRenderer.send('login', [username, hash_password, idnumber]);
}

/**
 * Three simple functions to display error messages on the login screen
 */
ipcRenderer.on('login_error_invalid_id', (event, args) => {
    $(function() {
        $("#invalid_id").get(0).innerHTML = "Please enter a valid ID!"
    });
});
ipcRenderer.on('login_error_no_id', (event, args) => {
    $(function() {
        $("#invalid_id").get(0).innerHTML = "Please enter a ID!"
    });
});

ipcRenderer.on('login_error_invalid_account', (event, args) => {
    $(function() {
        $("#invalid_id").get(0).innerHTML = "Please enter a valid username and password!"
    });
});