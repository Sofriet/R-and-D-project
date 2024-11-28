/**
 * List of electron modules
 */
const { app, BrowserWindow, globalShortcut } = require("electron");
const { ipcMain } = require('electron')

const nodePath = require("path");
const appWindow = require(nodePath.join(__dirname, 'assets/js/window.js'))

const url = require("url");
let mysql = require('mysql');
let fs = require("fs");

const YoutubeMusicApi = require('youtube-music-api')
const youtube_api = new YoutubeMusicApi()

/**
 * Initialization of global variables
 */
let win;
let org_id = 1;
let user_id = 1;



/**
 * Creates a list of the settings to connect to a database.
 * The current settings are for a locally hosted database without a password.
 */
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3307,
    database: 'rd'
});

/**
 * Establishes a connection to the database.
 */
connection.connect(function(err) {
    // in case of error
    if (err) {
        console.log("An error ocurred performing while connecting.");

        console.log(err.code);
        console.log(err.fatal);
    }
});

/**
 * On startup of the app, create the window.
 */
app.on('ready', () => {
    win = appWindow.create();

});

/**
 * On closing all the windows, quit the app.
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


/**
 * On closing of the app, ends the connection with the database.
 */
ipcMain.on('close', () => {
    // Close the connection
    connection.end(function() {
        // The connection has been closed
    });
    win.close()
})

/**
 * Minimize/maximizes the window
 */
ipcMain.on('minimize', () => {
    win.minimize()
})

ipcMain.on('maximize', () => {
    win.isMaximized() ? win.unmaximize() : win.maximize();
})

/**
 * On activation of the app, creates the appwindow if there is none.
 */
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        appWindow.create();
    }
});

/**
 * Prints debug commands to the console.
 */
ipcMain.on("console", (e, arg) => {
    console.log(arg);
})

/**
 * Changes the gobal variable storing the organization id.
 * 
 * @param   id  The new organization id.
 */
ipcMain.on("id_change", (e, id) => {
    org_id = id;
})


/**
 * Changes the amount of votes on a given song.
 * Increases the amount of votes if the user has not voted on the song.
 * Decrease the amount of votes if the user has currently voted on the song.
 * 
 * @param   song_id The id of the given song.
 */
ipcMain.on('alter_vote', (e, song_id) => {

    let lowest_unused_vote_slot = -1;
    let already_voted = false;
    let already_voted_slot = -1;

    $latest_org_query = `SELECT vote1, vote2, vote3, vote4, vote5 FROM users WHERE user_id = '${user_id}'`;

    connection.query($latest_org_query, function(err, rows, fields) {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        let vote_array = [rows[0].vote1, rows[0].vote2, rows[0].vote3, rows[0].vote4, rows[0].vote5];


        // Use a reversed array to easily identify the first empty vote
        for (let i = vote_array.length - 1; i >= 0; i--) {
            curr_vote = vote_array[i]
            if (curr_vote == song_id) {
                already_voted = true;
                already_voted_slot = i;
            } else if (curr_vote == null) {
                lowest_unused_vote_slot = i;
            }
        }

        // If the user had not voted on the song, update the database and the txt file with the new vote
        if (!already_voted) {

            $update_vote_query = `UPDATE users SET vote${lowest_unused_vote_slot+1} = '${song_id}' WHERE user_id = '${user_id}'`;

            connection.query($update_vote_query, function(err, rows, fields) {
                if (err) {
                    console.log("An error ocurred performing the query.");
                    console.log(err);
                    return;
                }
            });

            filename = "./assets/songlists/songs_" + org_id + ".txt";
            fs.readFile(filename, { encoding: 'utf8' }, function(err, buf) {
                const ids_txt = buf.toString().split('\n');
                ids_txt.forEach(id_t => {
                    if (id_t.slice(0, 11) == song_id) {
                        let vote_nr = (Number(id_t.slice(12)) + 1).toString();
                        new_id_t = id_t.slice(0, 12) + vote_nr
                        let new_content = buf.replace(id_t, new_id_t);

                        fs.writeFile(filename, new_content, 'utf8', function(err) {
                            if (err) return console.log(err);
                        });
                    }
                })
            });
        }

        // If there user has already voted on the song, remove the vote from the database and the txt file.
        else if (already_voted) {

            $update_vote_query = `UPDATE users SET vote${already_voted_slot+1} = NULL WHERE user_id = '${user_id}'`;

            connection.query($update_vote_query, function(err, rows, fields) {
                if (err) {
                    console.log("An error ocurred performing the query.");
                    console.log(err);
                    return;
                }
            });

            filename = "./assets/songlists/songs_" + org_id + ".txt";
            fs.readFile(filename, { encoding: 'utf8' }, function(err, buf) {
                const ids_txt = buf.toString().split('\n');
                ids_txt.forEach(id_t => {
                    if (id_t.slice(0, 11) == song_id) {
                        let vote_nr = (Number(id_t.slice(12)) - 1).toString();
                        new_id_t = id_t.slice(0, 12) + vote_nr
                        let new_content = buf.replace(id_t, new_id_t);

                        fs.writeFile(filename, new_content, 'utf8', function(err) {
                            if (err) return console.log(err);
                        });
                    }
                })
            });
        }
    });
})

/**
 * Logs a user in based on their username, password, and organization ID (if relevant)
 * 
 * @param   args    A list of arguments
 *                  0 = the username
 *                  1 = the (hashed) password
 *                  2 = the type of account, 0 for organization or 1 of voter
 */
ipcMain.on('login', (event, args) => {

    $login_query = `
    SELECT * FROM users WHERE username = '${args[0]}'
    AND password = '${args[1]}'
    `;

    connection.query($login_query, function(err, rows, fields) {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        if (rows.length <= 0) {
            event.sender.send("login_error_invalid_account");
        } else {

            $valid_id_query = `SELECT account_type FROM users WHERE user_id = '${args[2]}'`;

            connection.query($valid_id_query, function(err, rows_valid_id, fields) {
                if (err) {
                    console.log("An error ocurred performing the query.");
                    console.log(err);
                    return;
                }
                // Seperate if statements because rows_valid_id[0].account_type is null when there is no returned row
                if (rows[0]["account_type"] == 1) {
                    if (rows_valid_id.length > 0) {
                        if (rows_valid_id[0].account_type != 0) {
                            event.sender.send("login_error_invalid_id");
                            return;
                        }
                    } else {
                        event.sender.send("login_error_no_id");
                        return;
                    }
                }
                // If the ID is valid
                switch (rows.length) {
                    case 0:
                        event.sender.send("login_error_invalid_account");
                        break;
                    case 1:
                        if (rows[0]["account_type"] == 1) {
                            user_id = rows[0]["user_id"];
                            org_id = args[2];
                            change_recent(user_id, org_id);
                            win.loadURL(`file://${__dirname}/assets/pages/playlist_voter.html`)
                        } else {
                            org_id = rows[0]["user_id"];
                            win.loadURL(`file://${__dirname}/assets/pages/playlist_organiser.html`)
                        }
                        break;

                    default:
                        console.log("Error: multiple accounts found");
                        break;
                }
            });
        }
    });
});

/**
 * Changes the most recently visited organization of a given user.
 * 
 * @param   user_id The id of the visiting user
 * @param   org_id  The id of the organization being visited
 */
function change_recent(user_id, org_id) {

    $latest_org_query = `SELECT latest_org_id FROM users WHERE user_id = '${user_id}'`;

    connection.query($latest_org_query, function(err, rows_latest, fields) {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        if (rows_latest[0].latest_org_id === null) {
            $vote_update_query = `UPDATE users SET latest_org_id = '${org_id}', vote1 = NULL, vote2 = NULL, vote3 = NULL, vote4 = NULL, vote5 = NULL WHERE user_id = '${user_id}'`;

            connection.query($vote_update_query, function(err, rows, fields) {
                if (err) {
                    console.log("An error ocurred performing the query.");
                    console.log(err);
                    return;
                }
            });
            return;
        }

        // If the organization being visited is different, update the database and remove the current votes of the user
        if (rows_latest[0].latest_org_id != org_id) {
            $latest_org_query = `SELECT vote1, vote2, vote3, vote4, vote5 FROM users WHERE user_id = '${user_id}'`;

            connection.query($latest_org_query, function(err, rows_vote, fields) {
                if (err) {
                    console.log("An error ocurred performing the query.");
                    console.log(err);
                    return;
                }

                let vote_array = [rows_vote[0].vote1, rows_vote[0].vote2, rows_vote[0].vote3, rows_vote[0].vote4, rows_vote[0].vote5];

                // Remove the votes from the user from the database and the txt file
                filename = "./assets/songlists/songs_" + rows_latest[0].latest_org_id + ".txt";
                fs.readFile(filename, { encoding: 'utf8' }, function(err, buf) {
                    const ids_txt = buf.toString().split('\n');
                    let new_content = buf;
                    ids_txt.forEach(id_t => {
                        vote_array.forEach(vote => {

                            if (id_t.slice(0, 11) == vote) {
                                let vote_nr = (Number(id_t.slice(12)) - 1).toString();
                                new_id_t = id_t.slice(0, 12) + vote_nr
                                new_content = new_content.replace(id_t, new_id_t);
                            }
                        });
                    })
                    fs.writeFile(filename, new_content, 'utf8', function(err) {
                        if (err) return console.log(err);
                    });
                });

                $vote_update_query = `UPDATE users SET latest_org_id = '${org_id}', vote1 = NULL, vote2 = NULL, vote3 = NULL, vote4 = NULL, vote5 = NULL WHERE user_id = '${user_id}'`;

                connection.query($vote_update_query, function(err, rows, fields) {
                    if (err) {
                        console.log("An error ocurred performing the query.");
                        console.log(err);
                        return;
                    }
                });
            });
        }
    });
}

/**
 * Registers a new user, based on a given username and password
 * 
 * @param   args    A list of arguments
 *                  0 = the username
 *                  1 = the (hashed) password
 *                  2 = the type of account, 0 for organization or 1 of voter
 * 
 * @return          A boolean confirmation to the renderer indicating if the username already exists
 */
ipcMain.on('register_user', (event, args) => {

    $username_new_query = `SELECT * FROM users WHERE username = '${args[0]}'`;
    connection.query($username_new_query, function(err, rows, fields) {
        if (rows.length > 0) {
            event.sender.send('username_check', false);
        } else {

            $register_query = `INSERT INTO users (username, password, account_type) values ('${args[0]}', '${args[1]}', '${args[2]}')`;

            connection.query($register_query, function(err, rows, fields) {
                if (err) {
                    console.log("An error ocurred performing the query.");
                    console.log(err);
                    return;
                } else {

                    // Create a new txt file for the new organization to store the playlist
                    if (args[2] == 0) {
                        $username_new_query = `SELECT user_id FROM users WHERE username = '${args[0]}'`;
                        connection.query($username_new_query, function(err, rows_userid, fields) {
                            filename = "./assets/songlists/songs_" + rows_userid[0].user_id + ".txt";
                            fs.writeFile(filename, "", { flag: 'w' }, err => {
                                if (err) {
                                    console.error(err);
                                }
                            });
                        });
                    }
                    event.sender.send('username_check', true);
                }
            });
        }

    });
});

/**
 * Redirect the current page to a new given page
 * 
 * @param   filename    The file name of the page to redirect to
 */
ipcMain.on('page', (event, filename) => {
    win.loadURL(`file://${__dirname}/${filename}`)
});

/**
 * Gives the global organization id to the renderer
 * 
 * @param   return    The global organization id.
 */
ipcMain.on('get_org_id', (event, arg) => {
    event.sender.send("show_org_id", org_id);
});

/**
 * Adds a given song to the playlist of the organization.
 * 
 * @param   song_id    The id of the given song.
 * 
 * @return              A confirmation to the renderer that the song has been added to the playlist.
 */
ipcMain.on('add_song', (event, song_id) => {
    filename = "./assets/songlists/songs_" + org_id + ".txt";
    fs.readFile(filename, function(err, buf) {
        let buf_new = buf.toString() + `\n${song_id}:0`
        fs.writeFile(filename, buf_new, err => {
            if (err) {
                console.error(err);
            }
            event.sender.send("add_song_complete");
        });
    });
});

/**
 * Removes a given song from the playlist of the organization
 * 
 * @param   song_id    The id of the given song
 * 
 * @return              A confirmation to the renderer that the song has been added to the playlist
 */
ipcMain.on('remove_song', (event, song_id) => {

    filename = "./assets/songlists/songs_" + org_id + ".txt";

    $latest_org_query = `SELECT user_id, vote1, vote2, vote3, vote4, vote5 FROM users WHERE latest_org_id = '${org_id}'`;

    connection.query($latest_org_query, function(err, rows, fields) {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        // For every user who has most recently visited the current organization, remove all their votes of the given song
        rows.forEach(user => {
            let vote_array = [user.vote1, user.vote2, user.vote3, user.vote4, user.vote5];


            for (let i = 0; i < vote_array.length; i++) {
                if (song_id == vote_array[i]) {

                    $vote_update_query = `UPDATE users SET vote${i+1} = NULL WHERE user_id = '${user.user_id}'`;

                    connection.query($vote_update_query, function(err, rows, fields) {
                        if (err) {
                            console.log("An error ocurred performing the query.");
                            console.log(err);
                            return;
                        }
                    });
                }
            }
        });

        // Remove the song from the organization's txt file
        fs.readFile(filename, function(err, buf) {
            let buf_array = buf.toString().split('\n');
            buf_array = buf.toString().split('\n');
            for (i = 0; i < buf_array.length; i++) {
                if (buf_array[i].slice(0, 11) == song_id) {
                    buf_array.splice(i, 1);
                }
            }
            buf_new = buf_array.join('\n');

            fs.writeFile(filename, buf_new, { flag: 'w' }, err => {
                if (err) {
                    console.error(err);
                }
                event.sender.send("remove_song_complete");
            });
        });
    });
});

/**
 * Returns the relevant information of the songs in the playlist for the user screen
 * 
 * @param   playlist_id    The id of the given Youtube playlist
 * 
 * @return  ret_array  A array of relevant components of songs for the renderer
 *                     [[videoId, song_name, author_name, thumbnail_link, votes, voted_on], [..]]
 *                     0 = The id of the song
 *                     1 = The name of the song
 *                     2 = The name of the artist
 *                     3 = The link to the thumbnail
 *                     4 = The current amount of votes on the song
 *                     5 = A boolean stating if the user has voted on the
 */
ipcMain.on('youtube_get_playlist_songs_user', (event, playlist_id) => {
    let ret_array = [];
    let voted_on = false;

    youtube_api.initalize().then(info => {
        youtube_api.getPlaylist(playlist_id).then(result => {
            track_count = result["trackCount"];
            content = result["content"];

            filename = "./assets/songlists/songs_" + org_id + ".txt";

            $latest_org_query = `SELECT vote1, vote2, vote3, vote4, vote5 FROM users WHERE user_id = '${user_id}'`;

            connection.query($latest_org_query, function(err, rows, fields) {
                if (err) {
                    console.log("An error ocurred performing the query.");
                    console.log(err);
                    return;
                }

                let vote_array = [rows[0].vote1, rows[0].vote2, rows[0].vote3, rows[0].vote4, rows[0].vote5];

                // Read the information from the songs in the playlist
                fs.readFile(filename, function(err, buf) {
                    const ids_txt = buf.toString().split('\n');

                    content.forEach(song => {
                        voted_on = false;
                        ids_txt.forEach(id_t => {
                            if (id_t.slice(0, 11) == song["videoId"]) {
                                thumbnail_length = song["thumbnails"].length;
                                if (thumbnail_length > 0) {
                                    thumbnail_url = song["thumbnails"][thumbnail_length - 1]["url"]
                                } else {
                                    thumbnail_url = "no_thumbnail_found";
                                }
                                vote_array.forEach(vote => {
                                    if (vote == song["videoId"])
                                        voted_on = true;
                                });
                                ret_array.push([song["videoId"], song["name"], song["author"]["name"], thumbnail_url, id_t.slice(12), voted_on]);
                            }
                        })
                    })

                    event.sender.send("ret_youtube_get_playlist_songs", ret_array);
                });
            });
        })
    })

});

/**
 * Returns the relevant information of the songs in the playlist for the organization screen
 * 
 * @param   playlist_id    The id of the given Youtube playlist
 * 
 * @return  ret_array  A array of relevant components of songs for the renderer
 *                     [[videoId, song_name, author_name, thumbnail_link, votes], [..]]
 *                     0 = The id of the song
 *                     1 = The name of the song
 *                     2 = The name of the artist
 *                     3 = The link to the thumbnail
 *                     4 = The current amount of votes on the song
 */
ipcMain.on('youtube_get_playlist_songs_org', (event, playlist_id) => {
    let ret_array = [];

    youtube_api.initalize().then(info => {
        youtube_api.getPlaylist(playlist_id).then(result => {
            track_count = result["trackCount"];
            content = result["content"];

            filename = "./assets/songlists/songs_" + org_id + ".txt";

            // Read the information from the songs in the playlist
            fs.readFile(filename, function(err, buf) {
                const ids_txt = buf.toString().split('\n');
                content.forEach(song => {
                    ids_txt.forEach(id_t => {
                        if (id_t.slice(0, 11) == song["videoId"]) {
                            thumbnail_length = song["thumbnails"].length;
                            if (thumbnail_length > 0) {
                                thumbnail_url = song["thumbnails"][thumbnail_length - 1]["url"]
                            } else {
                                thumbnail_url = "no_thumbnail_found";
                            }
                            ret_array.push([song["videoId"], song["name"], song["author"]["name"], thumbnail_url, id_t.slice(12)]);
                        }
                    })
                })
                event.sender.send("ret_youtube_get_playlist_songs", ret_array);
            })
        });
    });
})

/**
 * Returns the relevant information of the songs in the playlist for the organization add screen
 * 
 * @param   playlist_id    The id of the given Youtube playlist
 * 
 * @return  ret_array  A array of relevant components of songs for the renderer
 *                     [[videoId, song_name, author_name, thumbnail_link, votes], [..]]
 *                     0 = The id of the song
 *                     1 = The name of the song
 *                     2 = The name of the artist
 *                     3 = The link to the thumbnail
 */
ipcMain.on('youtube_get_playlist_songs_org_add', (event, playlist_id) => {
    let ret_array = []
    youtube_api.initalize().then(info => {
        youtube_api.getPlaylist(playlist_id).then(result => {
            track_count = result["trackCount"];
            content = result["content"];

            // Read the information of the songs in the playlist to only display unused songs from the Youtube playlist
            filename = "./assets/songlists/songs_" + org_id + ".txt";
            fs.readFile(filename, function(err, buf) {
                const ids_txt = buf.toString().split('\n');

                content.forEach(song => {
                    in_playlist = false;
                    ids_txt.forEach(id_t => {
                        if (id_t.slice(0, 11) == song["videoId"]) {
                            in_playlist = true;
                        }
                    })
                    if (!in_playlist) {
                        thumbnail_length = song["thumbnails"].length;
                        if (thumbnail_length > 0) {
                            thumbnail_url = song["thumbnails"][thumbnail_length - 1]["url"]
                        } else {
                            thumbnail_url = "no_thumbnail_found";
                        }
                        ret_array.push([song["videoId"], song["name"], song["author"]["name"], thumbnail_url]);
                    }
                })
                event.sender.send("ret_youtube_get_playlist_songs_org_add", ret_array);
            });
        })
    })
});