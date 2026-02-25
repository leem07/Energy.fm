import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import { tracingChannel } from 'node:diagnostics_channel';

dotenv.config();
const ai = new GoogleGenAI({});
interface Song { rating: string; trackID: string};
let songJson: Record<string, Song[]> = { "0.0": [], "0.1": [], "0.2": [], "0.3": [], "0.4": [], 
                "0.5": [], "0.6": [], "0.7": [], "0.8": [], "0.9": [] };

async function getEnergyRating(trackID: string) {
    // SPOTIFY STUFF - GET SONG NAME/ARTIST
    const clientID = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const sdk = SpotifyApi.withClientCredentials(clientID!, clientSecret!);
    const song = await sdk.tracks.get(trackID);
    const songName = song["name"];
    const artistName = song["artists"][0]["name"];
    // console.log(song["name"]);
    // console.log(song["artists"][0]["name"]);

    // GEMINI API - GET ENERGY SCORE
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Rate the song ${songName} by ${artistName} for its energy 
                    from 0 to 1, 0 being low energy and 1 being high energy.
                    Give only the rating.`
    });
    const rating: string = response.text!;
    // console.log(rating);

    // Return rating and song ID
    return [rating, trackID];
}

async function addSong(rating: string, trackID: string) {
    songJson[rating.substring(0,3)].push({rating, trackID});

    console.log(songJson);
}

// getEnergyRating("4Oih3RDrSFg3afaOphBVuy");

// addSong("0.29", "4Oih3RDrSFg3afaOphBVuy");
// addSong("0.49", "ljwf39fsjklw3lrkj3213l");
