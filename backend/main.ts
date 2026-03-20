import * as SongDetails from "./song-ratings.js";
import { getHeartRateNow } from "./heart-rate.js";
import * as path from "path";

export async function main() {

    let songIDList: string[] = [];
    // Get playlist songs and add them to json


    // Get heart rate
    const bpm = getHeartRateNow(path.join(process.cwd(), "heart-rate.csv"));
    console.log("current bucket bpm:", bpm);
    
    // Get heart rate conversion

    // Search 

}

main().catch(console.error);
