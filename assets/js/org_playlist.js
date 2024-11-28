/**
 * Add listeners of the input fiels.
 * The enter button will now work to accept the input.
 */
let search_button_song = document.getElementById("searchInputSong");
search_button_song.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        search();
    }
});

let search_button_artist = document.getElementById("searchInputArtist");
search_button_artist.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        search();
    }
});

/**
 * Sends a request to main to give a list of the songs that are in the organization's playlist.
 * 
 * @return the id of the organization's Youtube playlist.
 */
function search() {
    ipcRenderer.send("youtube_get_playlist_songs_org", "PLo17z1NSvpFQ4xdj8kOpQKopG7olxlo69");
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
 *                     4 = The current amount of votes on the song
 */
ipcRenderer.on('ret_youtube_get_playlist_songs', (event, arr_songs) => {

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
                <h3 class="artistAndvotes"> \
                    ${song[2]} &nbsp <span>${song[4]}</span> votes \
                </h3> \
            <button onclick="remove_song('${song[0]}')" type="button" class="noborder voteButton" id="symbol"><i class="fa fa-trash-o"></i></button> \
        </div> \
        `
    });

    $(function() {
        $("#display_songs").get(0).innerHTML = html_text
    });

})

/**
 * Send a request to main to remove a song to the organization's playlist.
 * 
 * @return the id of the song to remove
 */
function remove_song(id) {
    ipcRenderer.send("remove_song", id);
}

/**
 * A confirmation that the song has been removed to the organization's playlist.
 * Call the search fuction to display the new list
 */
ipcRenderer.on('remove_song_complete', (event, arg) => {
    search();
})

/**
 * Displays the id number of a given organization
 * 
 * @param   id  The id of the given organization
 */
ipcRenderer.on('show_org_id', (event, id) => {
    $(function() {
        $("#IDnumber").get(0).innerHTML = "Organization ID: " + id;
    });
})

/**
 * Redirects to the organization's playlist page.
 */
function add_song_page() {
    ipcRenderer.send('page', "./assets/pages/playlist_organiser_add.html");
}

/**
 * Call the search fuction to display the playlist when loading the page.
 */
$(document).ready(function() {
    search();
    ipcRenderer.send("get_org_id");
});