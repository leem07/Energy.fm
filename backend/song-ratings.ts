import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface Song { rating: string; trackID: string };

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
    const bucket = (Math.floor(parseFloat(rating) * 10) / 10).toFixed(1);
    songJson[bucket].push({ rating, trackID });
    songJson[bucket].sort((a, b) => parseFloat(a.rating) - parseFloat(b.rating));
}

export async function getSongDetails(trackID: string) {
    const clientID = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const sdk = SpotifyApi.withClientCredentials(clientID!, clientSecret!);
    const song = await sdk.tracks.get(trackID);
    return [song.name, song.artists[0].name];
}

export async function getEnergyRating(songName: string, artistName: string) {
    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{
            role: "user",
            content: `You are a music analysis system.

Rate the ENERGY of the song "${songName}" by ${artistName} on a scale from 0.0 to 1.0.

Energy definition:
- 0.0 = very calm, slow, soft (e.g. ambient, acoustic, lullaby)
- 0.3 = relaxed, mellow
- 0.5 = moderate, typical pop
- 0.7 = upbeat, danceable
- 1.0 = intense, fast, loud (e.g. EDM, hype, aggressive)

Rules:
- Output ONLY a number between 0.0 and 1.0
- Use exactly 2 decimal places (e.g. 0.37)
- Do NOT include any text

Energy rating:`
        }],
        max_tokens: 10,
    });

    return response.choices[0]?.message?.content?.trim() ?? "0.50";
}