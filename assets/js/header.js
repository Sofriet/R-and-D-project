const { ipcRenderer } = require('electron')
const S3 = require('aws-sdk/clients/s3')
let $ = jQuery = require('jquery');
const { sha256 } = require("js-sha256");


/**
 * Add listeners of the close, maximize and minimize buttons
 */
document.getElementById('close').addEventListener('click', closeWindow);
document.getElementById('maximize').addEventListener('click', maximizeWindow);
document.getElementById('minimize').addEventListener('click', minimizeWindow);

/**
 * Close the window when the close button in clicked.
 */
function closeWindow() {
    ipcRenderer.send('close')
}

/**
 * Maximize the window when the maximize button in clicked.
 */
function maximizeWindow() {
    ipcRenderer.send('maximize')
}

/**
 * Minimize the window when the minimize button in clicked.
 */
function minimizeWindow() {
    ipcRenderer.send('minimize')
}


/**
 * Sorts two lists of variables in a decending order.
 * This function is used to display the songs in a decending order of total votes
 */
function sortByVote(a, b) {
    let i = 4;
    let value_1 = Number(a[i]);
    let value_2 = Number(b[i]);
    if (value_1 === value_2) {
        return 0;
    } else {
        return (value_1 < value_2) ? 1 : -1;
    }
}