/**
 * Redirect to the home page.
 * 
 * @return send a request to main to redirect to the index.html page
 */
function redirect_home_page() {
    ipcRenderer.send('page', "./assets/pages/../../index.html");
}

/**
 * Redirect to the registration form for the user.
 * 
 * @return send a request to main to redirect to the register_user.html page
 */
function register_user_page() {
    ipcRenderer.send('page', "./assets/pages/register_user.html");
}


/**
 * Redirect to the registration form for an organization.
 * 
 * @return send a request to main to redirect to the register_org_page.html page
 */
function register_org_page() {
    ipcRenderer.send('page', "./assets/pages/register_org.html");
}

/**
 * Attempts to register a user.
 * Reads the input field of username, password as registration info.
 * Changes and button and send a confirmation message according to the success.
 * 
 * @return  Sends the registration info to main
 */
function register_user(type) {

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let hash_password = sha256(password);

    // send username to main.js 
    ipcRenderer.send('register_user', [username, hash_password, type]);

    // receive message from main.js
    ipcRenderer.on('username_check', (event, arg) => {
        if (!arg) {
            ipcRenderer.send('console', "Error: username is already in use")
            document.getElementById("continueButton").style.display = "none";
            $(function() {
                $("#successMessage").get(0).innerHTML = "Username is already in use";
            });
        } else {
            document.getElementById("registerButton").style.display = "none";
            document.getElementById("cancelButton").style.display = "none";
            document.getElementById("continueButton").style.display = "inline";
            $(function() {
                $("#successMessage").get(0).innerHTML = "Account Created!";
            });
        }
    })
}

/**
 * Stop the continue button from displaying when the page is loaded
 */
$(document).ready(function() {
    document.getElementById("continueButton").style.display = "none";
});