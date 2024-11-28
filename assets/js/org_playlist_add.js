/**
 * Add listeners of the input fiels.
 * The enter button will now work to accept the input.
 */
let search_button_song = document.getElementById("searchInputSong");
search_button_song.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        search_add();
    }
});

let search_button_artist = document.getElementById("searchInputArtist");
search_button_artist.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        search_add();
    }
});

/**
 * Sends a request to main to give a list of songs that could be added to the organization's playlist.
 * 
 * @return the id of the organization's Youtube playlist.
 */
function search_add() {
    ipcRenderer.send("youtube_get_playlist_songs_org_add", "PLo17z1NSvpFQ4xdj8kOpQKopG7olxlo69");
}

/**
 * Generates HTML code based on the list of values.
 * This HTML shows the songs that could be added to the organization's playlist.
 * 
 * @param  arr_songs  A array of relevant components of songs for the renderer
 *                     [[videoId, song_name, author_name, thumbnail_link, votes], [..]]
 *                     0 = The id of the song
 *                     1 = The name of the song
 *                     2 = The name of the artist
 *                     3 = The link to the thumbnail
 */
ipcRenderer.on('ret_youtube_get_playlist_songs_org_add', (event, arr_songs) => {

    let html_text = '';
    let filtered_array_title = []
    let filtered_array_title_and_artist = []

    let search_title = document.getElementById("searchInputSong").value;
    let search_artist = document.getElementById("searchInputArtist").value;


    // Custom Filter
    arr_songs.forEach(song => {
        if (song[1].toLowerCase().indexOf(search_title.toLowerCase()) > -1)
            filtered_array_title.push(song);
    })

    filtered_array_title.forEach(song => {
        if (song[2].toLowerCase().indexOf(search_artist.toLowerCase()) > -1)
            filtered_array_title_and_artist.push(song);
    })

    filtered_array_title_and_artist.sort(sortByVote);

    // Generate the HTML code
    filtered_array_title_and_artist.forEach(song => {
        html_text += ` \
        <div class="song"> \
            <img id=MusicNote src="${(song[3] == "no_thumbnail_found") ? "music_note.jpg" : song[3]}"></img> \
            <h2>${song[1]}</h2> \
                <h3> \
                    ${song[2]} \
                </h3> \
                <button onclick="add_song('${song[0]}')" type="button" class="addButton" id="symbol">+</button> \
        </div> \
        `
    });

    $(function() {
        $("#display_songs").get(0).innerHTML = html_text
    });
})

/**
 * Send a request to main to add a song to the organization's playlist.
 * 
 * @return the id of the song to add
 */
function add_song(song_id) {
    ipcRenderer.send("add_song", song_id);
}

/**
 * A confirmation that the song has been added to the organization's playlist.
 * Call the search_add fuction to display the new list
 */
ipcRenderer.on('add_song_complete', (event, arg) => {
    search_add();
})

/**
 * Redirects to the organization's playlist page.
 */
function org_playlist_page() {
    ipcRenderer.send('page', "./assets/pages/playlist_organiser.html");
}

/**
 * Call the search_add fuction to display the playlist when loading the page.
 */
$(document).ready(function() {
    search_add();
});