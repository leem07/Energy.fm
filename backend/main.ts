import * as SongDetails from "./song-ratings";

export async function main() {

    let songIDList: string[] = [];
    // Get playlist songs

    let songJSON = SongDetails.createJSON();
    for (let i = 0; i < songIDList.length; i++) {
        let [song, artist] = await SongDetails.getSongDetails(songIDList[i]);
        let songRating = await SongDetails.getEnergyRating(song, artist);
        SongDetails.addSong(songJSON, songRating, songIDList[i]);    
    }

    // Get heart rate
    
    
    // Get heart rate conversion

    // Search 

}

