// blah blah
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

async function songDetails(songName: string) {
    const clientID = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const sdk = SpotifyApi.withClientCredentials(clientID!, clientSecret!);

    const trackDetails = await sdk.search(songName, ["track"]);
    const track = trackDetails.tracks.items[0];
    console.log(`Spotify ID found: ${track.id}`);

    const reccoURL = `https://api.reccobeats.com/v1/track/:id/audio-features`;
    const songInfo = await axios.get(reccoURL, {params: {ids: track.id}});
    console.log(songInfo);
}

songDetails("Eye of the Tiger");