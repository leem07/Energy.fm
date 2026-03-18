import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import { tracingChannel } from 'node:diagnostics_channel';
// import songJson from './songs.json' assert { type: 'json'};
import { readFile, writeFile } from 'fs/promises';

dotenv.config();
const ai = new GoogleGenAI({});
interface Song { rating: string; trackID: string};

/* JSON FUNCTIONS */
export function createJSON() {
    let songJson: Record<string, Song[]> = { "0.0": [], "0.1": [], "0.2": [], "0.3": [], "0.4": [], 
                                            "0.5": [], "0.6": [], "0.7": [], "0.8": [], "0.9": [] };
    return songJson;
}

export function resetJSON(songJson: Record<string, Song[]>) {
    songJson = { "0.0": [], "0.1": [], "0.2": [], "0.3": [], "0.4": [], 
                "0.5": [], "0.6": [], "0.7": [], "0.8": [], "0.9": [] };
}

export function addSong(songJson: Record<string, Song[]>, rating: string, trackID: string) {
    songJson[rating.substring(0,3)].push({rating, trackID});

    songJson[rating.substring(0,3)].sort((a,b) => {
        return parseFloat(a.rating) - parseFloat(b.rating);
    })
}

export async function getBestMatch(heartRate: number) {
    // Read JSON file
    const raw = await readFile("./backend/songs.json", "utf8");
    const obj = JSON.parse(raw);

    // Search through index
    let index = String(heartRate).substring(0,3);
    const arr = obj.buckets[index];
    let bestFit = arr[0];

    // Empty index
    // if (arr.length == 0) {
        // for (let i = index; i )
    // }

    // else {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].rating >= heartRate) {
                bestFit = arr[i].trackID;
                break;
            }
        }
    // }
    
    return bestFit;
}

// export function getHighMatch(songJson: Record)

/* API FUNCTIONS */
export async function getSongDetails(trackID: string) {
    // SPOTIFY STUFF - GET SONG NAME/ARTIST
    const clientID = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const sdk = SpotifyApi.withClientCredentials(clientID!, clientSecret!);
    const song = await sdk.tracks.get(trackID);
    const songName = song["name"];
    const artistName = song["artists"][0]["name"];
    // console.log(song["name"]);
    // console.log(song["artists"][0]["name"]);
    return [songName, artistName];
}

export async function getEnergyRating(songName: string, artistName: string) {
    // GEMINI API - GET ENERGY SCORE
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Rate the song ${songName} by ${artistName} for its energy 
                    from 0 to 1, 0 being low energy and 1 being high energy.
                    Give only the rating.`
    });
    const rating: string = response.text!;
    // console.log(rating);

    return rating;
}


// getEnergyRating("4Oih3RDrSFg3afaOphBVuy");
// let json = createJSON();
// addSong(json, "0.29", "4Oih3RDrSFg3afaOphBVuy");
// addSong(json, "0.22", "a3wjlv9zaa3l3wrcs9lwk3");
// addSong(json, "0.49", "ljwf39fsjklw3lrkj3213l");
// console.log(json);
// console.log(readJson());
// getBestMatch(0.35);