import { Request, Response, Router } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

async function getSpotifyToken() {
  try {
    const auth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({ grant_type: "client_credentials" }).toString(),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Error getting Spotify token:", error);
    throw new Error("Failed to authenticate with Spotify");
  }
}

async function searchPlaylists(mood: string, token: string) {
  try {
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: mood,
        type: "playlist",
        market: "ES",
        limit: 50, 
      },
    });

    const playlists = response.data.playlists.items;

    if (!playlists.length) {
      throw new Error("No playlists found for this mood");
    }

    const randomPlaylist =
      playlists[Math.floor(Math.random() * playlists.length)];

    return {
      name: randomPlaylist.name,
      creator: randomPlaylist.owner.display_name,
      url: randomPlaylist.external_urls.spotify,
      image: randomPlaylist.images[0]?.url,
    };
  } catch (error) {
    console.error("Error fetching playlist from Spotify:", error);
    throw new Error("Could not fetch playlist from Spotify");
  }
}

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { mood } = req.body;

    if (!mood) {
      res.status(400).json({ error: "Mood is required" });
      return;
    }

    const token = await getSpotifyToken();
    const playlist = await searchPlaylists(mood, token);

    res.json({
      mood,
      playlist,
      message: `Here's a playlist to match your mood! 🎶`,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to generate playlist",
      message: error.message,
    });
    return;
  }
});

export async function searchPlaylistsTokenless(mood: string) {
  const token = await getSpotifyToken();
  const playlist = await searchPlaylists(mood, token);
  return playlist;
}

export default router;
