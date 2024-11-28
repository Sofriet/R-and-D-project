/**
 * Logs the user out. 
 */
function logout() {
    ipcRenderer.send('page', "./index.html");
}