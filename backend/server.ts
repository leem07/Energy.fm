import express, { Request, Response } from "express";
import querystring from "querystring";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

if (!client_id) throw new Error("Missing CLIENT_ID in .env");
if (!client_secret) throw new Error("Missing CLIENT_SECRET in .env");

const redirect_uri = "http://127.0.0.1:8888/callback";

let access_token: string | null = null;
let refresh_token: string | null = null;
let last_state: string | null = null;


function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

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
        show_dialog: true
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
    return res.status(500).json({ error: "token_exchange_failed", details: tokenJson });
  }

  access_token = tokenJson.access_token as string;
  if (tokenJson.refresh_token) {
    refresh_token = tokenJson.refresh_token as string;
  }  

  res.send(`
    <h2>Login success</h2>
    <p>Now try: <a href="/liked">/liked</a></p>
  `);
});

//get liked songs
app.get("/liked", async (req: Request, res: Response) => {
  if (!access_token) {
    return res
      .status(401)
      .send('No token yet. Go to <a href="/login">/login</a> first.');
  }

  try {
    const limit = Math.min(Number(req.query.limit ?? 20), 50);
    const offset = Math.max(Number(req.query.offset ?? 0), 0);

    const r = await fetch(
      `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const text = await r.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!r.ok) {
      return res.status(r.status).json({
        error: "spotify_api_error",
        status: r.status,
        statusText: r.statusText,
        details: data,
      });
    }

    const songs = (data.items ?? []).map((item: any) => ({
      id: item.track?.id,
      name: item.track?.name,
      artist: (item.track?.artists ?? []).map((a: any) => a.name).join(", "),
    }));
    
    const list = songs
      .map((s: any, index: number) => `
        <div style="margin-bottom: 12px;">
          <div>${index + 1}. ${s.name} — ${s.artist}</div>
          <div style="margin-left: 16px">id: ${s.id}</div>
        </div>
      `)
      .join("");
    
    return res.send(`
      <h2>Liked Songs</h2>
      <p>Total songs: ${data.total}</p>
      <div>${list}</div>
    `);
  } catch (err: any) {
    console.error("Error fetching liked songs:", err);
    return res.status(500).json({
      error: "failed_to_fetch_liked_songs",
      message: err?.message ?? String(err),
    });
  }
});

app.listen(8888, () => {
  console.log("http://127.0.0.1:8888/login");
});

