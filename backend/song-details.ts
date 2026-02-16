import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

export async function getEnergyRating(trackID: string) {
    // SPOTIFY STUFF - GET SONG NAME/ARTIST
    const clientID = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const sdk = SpotifyApi.withClientCredentials(clientID!, clientSecret!);
    const song = await sdk.tracks.get(trackID);
    const songName = song["name"];
    const artistName = song["artists"][0]["name"];
    console.log(song["name"]);
    console.log(song["artists"][0]["name"]);

    // GEMINI API
    const rating = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Rate the song ${songName} by ${artistName} for its energy 
                    from 0 to 1, 0 being low energy and 1 being high energy.
                    Give only the rating.`
    });
    console.log(rating.text);
    return parseFloat(rating.text!);
}

getEnergyRating("02sy7FAs8dkDNYsHp4Ul3f");

