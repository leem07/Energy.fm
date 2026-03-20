import express, { Request, Response } from "express";
import querystring from "querystring";
import crypto from "crypto";
import dotenv from "dotenv";
import cors from 'cors';
import * as fs from "fs";
import * as path from "path";
import * as SongDetails from "./song-ratings";

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

if (!client_id) throw new Error("Missing CLIENT_ID in .env");
if (!client_secret) throw new Error("Missing CLIENT_SECRET in .env");

const redirect_uri = "http://127.0.0.1:8888/callback";

let access_token: string | null = null;
let refresh_token: string | null = null;
let last_state: string | null = null;

const SONGS_JSON_PATH = path.join(process.cwd(), "songs.json");

function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

//cache functions
function loadCache() {
  try {
    if (!fs.existsSync(SONGS_JSON_PATH)) {
      return {
        updatedAt: new Date(0).toISOString(),
        tracksById: {},
        buckets: SongDetails.createJSON(),
      };
    }

    const raw = fs.readFileSync(SONGS_JSON_PATH, "utf-8").trim();
    if (!raw) {
      return {
        updatedAt: new Date(0).toISOString(),
        tracksById: {},
        buckets: SongDetails.createJSON(),
      };
    }

    const parsed = JSON.parse(raw);

    return {
      updatedAt: parsed.updatedAt ?? new Date(0).toISOString(),
      tracksById: parsed.tracksById ?? {},
      buckets: parsed.buckets ?? SongDetails.createJSON(),
    };
  } catch {
    return {
      updatedAt: new Date(0).toISOString(),
      tracksById: {},
      buckets: SongDetails.createJSON(),
    };
  }
}

function saveCache(cache: any) {
  cache.updatedAt = new Date().toISOString();
  fs.writeFileSync(SONGS_JSON_PATH, JSON.stringify(cache, null, 2));
}

async function getEnergyRatingWithRetry(
  songName: string,
  artistName: string,
  retries = 3
) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await SongDetails.getEnergyRating(songName, artistName);
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      const is429 =
        msg.includes("429") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("Quota exceeded");

      if (!is429 || attempt === retries) throw e;

      await sleep(31_000);
    }
  }
  throw new Error("unreachable");
}

// heart rate variables
let heartRateIndex = 0;
let heartRateData: number[] = [];

function loadHeartRateCSV() {
  try {
    const csvPath = path.join(process.cwd(), "heart-rate.csv");
    const fileContent = fs.readFileSync(csvPath, "utf-8");
    const lines = fileContent.trim().split('\n').slice(1);
    heartRateData = lines.map(line => parseInt(line.split(',')[1]));
    console.log(`Loaded ${heartRateData.length} heart rate readings`);
  } catch (err) {
    console.error('Failed to load heart rate CSV:', err);
  }
}

loadHeartRateCSV();

// auto advance every 5 minutes
setInterval(() => {
  if (heartRateData.length > 0) {
    heartRateIndex = (heartRateIndex + 1) % heartRateData.length;
    console.log(`Heart rate: ${heartRateData[heartRateIndex]} BPM (row ${heartRateIndex})`);
  }
}, 300000);

//login
app.get("/login", (req: Request, res: Response) => {
  const state = generateRandomString(16);
  last_state = state;

  const scope =
    "user-read-private user-read-email user-library-read playlist-read-private";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id,
        scope,
        redirect_uri,
        state,
        show_dialog: true,
      })
  );
});

//callback
app.get("/callback", async (req: Request, res: Response) => {
  const code = (req.query.code as string) || null;
  const state = (req.query.state as string) || null;

  if (!state || !last_state || state !== last_state) {
    return res.status(400).send("state_mismatch");
  }

  last_state = null;

  if (!code) return res.status(400).send("missing_code");

  const body = new URLSearchParams({
    code,
    redirect_uri,
    grant_type: "authorization_code",
  });

  const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

  const tokenResp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body,
  });

  const tokenJson = await tokenResp.json();

  if (!tokenResp.ok) {
    return res.status(500).json(tokenJson);
  }

  access_token = tokenJson.access_token;
  refresh_token = tokenJson.refresh_token ?? null;

  res.redirect(`http://localhost:3000/?access_token=${access_token}`);
});

//liked + cache
app.get("/liked", async (req: Request, res: Response) => {
  if (!access_token) {
    return res.status(401).send("Login first at /login");
  }

  try {
    const limit = Math.min(Number(req.query.limit ?? 20), 50);
    const offset = Math.max(Number(req.query.offset ?? 0), 0);

    const r = await fetch(
      `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json(data);
    }

    const tracks = (data.items ?? [])
      .map((item: any) => item.track)
      .filter((t: any) => t?.id && t?.name && Array.isArray(t?.artists));

    const cache = loadCache();
    const newTracks = tracks.filter((t: any) => !cache.tracksById[t.id]);
    const newlyRated: Array<{ id: string; name: string; rating: string }> = [];

    for (const track of newTracks) {
      const artist = track.artists.map((a: any) => a.name).join(", ");
      const rating = await getEnergyRatingWithRetry(track.name, artist);

      cache.tracksById[track.id] = { trackID: track.id, rating };
      SongDetails.addSong(cache.buckets, rating, track.id);
      newlyRated.push({ id: track.id, name: track.name, rating });

      await sleep(12_500);
    }

    if (newlyRated.length > 0) {
      saveCache(cache);
    }

    return res.json({
      totalLiked: data.total,
      fetchedThisPage: tracks.length,
      newSongsRated: newlyRated.length,
      updatedAt: cache.updatedAt,
      buckets: cache.buckets,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      error: "failed_to_process_liked_songs",
      message: err?.message ?? String(err),
    });
  }
});

//me
app.get("/me", async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "not_logged_in" });

  console.log("Token received:", token?.slice(0, 20) + "...");

  const r = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await r.text();
  console.log("Spotify response:", text.slice(0, 100));

  try {
    const data = JSON.parse(text);
    res.json(data);
  } catch {
    res.status(500).json({ error: "invalid_response", raw: text });
  }
});

//search
app.get("/search", async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const query = req.query.q as string;

  if (!token) return res.status(401).json({ error: "not_logged_in" });
  if (!query) return res.status(400).json({ error: "missing_query" });

  const r = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const text = await r.text();
  try {
    const data = JSON.parse(text);
    res.json(data);
  } catch {
    res.status(500).json({ error: "invalid_response", raw: text });
  }
});

//rate songs
app.get("/rate-songs", async (req: Request, res: Response) => {
  const ids = (req.query.ids as string)?.split(',') ?? [];
  if (!ids.length) return res.status(400).json({ error: "missing_ids" });

  try {
    const cache = loadCache();
    const cachedIds = ids.filter(id => cache.tracksById[id]);
    const uncachedIds = ids.filter(id => !cache.tracksById[id]);

    const cachedRatings = cachedIds.map(id => ({
      trackID: id,
      energy: parseFloat(cache.tracksById[id].rating),
    }));

    let newRatings: any[] = [];
    if (uncachedIds.length > 0) {
      try {
        newRatings = await Promise.all(
          uncachedIds.map(async (trackID) => {
            const [songName, artistName] = await SongDetails.getSongDetails(trackID);
            const rating = await getEnergyRatingWithRetry(songName, artistName);
            return { trackID, energy: parseFloat(rating), rating };
          })
        );

        for (const { trackID, rating } of newRatings) {
          cache.tracksById[trackID] = { trackID, rating };
          SongDetails.addSong(cache.buckets, rating, trackID);
        }
        saveCache(cache);

      } catch (err: any) {
        console.error('Rating failed, using fallback:', err.message);
        newRatings = uncachedIds.map(id => ({ trackID: id, energy: 0.5 }));
      }
    }

    const allRatings = [...cachedRatings, ...newRatings.map(r => ({ trackID: r.trackID, energy: r.energy }))];
    const ordered = ids.map(id => allRatings.find(r => r.trackID === id) ?? { trackID: id, energy: 0.5 });

    res.json({ ratings: ordered });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//heart rate
app.get("/heart-rate", (req: Request, res: Response) => {
  if (heartRateData.length === 0) {
    return res.status(500).json({ error: "no heart rate data" });
  }
  const bpm = heartRateData[heartRateIndex];
  const time = `${String(Math.floor(heartRateIndex / 6)).padStart(2, '0')}:${String((heartRateIndex % 6) * 10).padStart(2, '0')}`;
  res.json({ bpm, time, index: heartRateIndex });
});

// manual advance
app.post("/heart-rate/next", (req: Request, res: Response) => {
  if (heartRateData.length === 0) {
    return res.status(500).json({ error: "no heart rate data" });
  }
  heartRateIndex = (heartRateIndex + 1) % heartRateData.length;
  const bpm = heartRateData[heartRateIndex];
  const time = `${String(Math.floor(heartRateIndex / 6)).padStart(2, '0')}:${String((heartRateIndex % 6) * 10).padStart(2, '0')}`;
  res.json({ bpm, time, index: heartRateIndex });
});

//start server
app.listen(8888, () => {
  console.log("http://127.0.0.1:8888/login");
});