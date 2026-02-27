import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { acquireKey, reportKeyUsage } from "../core/keyVault";
import { getAssetsDir } from "../core/fileStore";

async function keyedFetch(provider: "cerebras" | "unrealspeech" | "cloudflare" | "serpstack" | "catbox" | "facebook", url: string, init: RequestInit) {
  const key = await acquireKey(provider);
  try {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${key.key}`);
    const res = await fetch(url, { ...init, headers });
    if (!res.ok) {
      await reportKeyUsage(provider, key.id, true);
      throw new Error(`${provider} failed ${res.status}`);
    }
    await reportKeyUsage(provider, key.id, false);
    return res;
  } catch (error) {
    await reportKeyUsage(provider, key.id, true);
    throw error;
  }
}

export async function fetchTrendingNews(topic: string) {
  const key = await acquireKey("serpstack");
  try {
    const params = new URLSearchParams({ access_key: key.key, query: topic });
    const res = await fetch(`https://api.serpstack.com/search?${params.toString()}`);
    if (!res.ok) throw new Error(`serpstack ${res.status}`);
    await reportKeyUsage("serpstack", key.id, false);
    return await res.json();
  } catch (e) {
    await reportKeyUsage("serpstack", key.id, true);
    throw e;
  }
}

export async function generateScript(news: unknown) {
  const res = await keyedFetch("cerebras", "https://api.cerebras.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.1-8b",
      messages: [
        { role: "system", content: "Create scam-awareness short-form scripts with hook, narrative, CTA and first comment as JSON." },
        { role: "user", content: JSON.stringify(news) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "script",
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              hook: { type: "string" },
              narrative: { type: "string" },
              cta: { type: "string" },
              firstComment: { type: "string" },
            },
            required: ["title", "hook", "narrative", "cta", "firstComment"],
          },
        },
      },
    }),
  });
  const data: any = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(content);
}

export async function synthVoiceover(text: string) {
  const res = await keyedFetch("unrealspeech", "https://api.v8.unrealspeech.com/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Text: text, VoiceId: "Liv", Bitrate: "192k", OutputFormat: "mp3", Timestamps: true }),
  });
  const arrayBuffer = await res.arrayBuffer();
  const voicePath = path.join(getAssetsDir(), `${randomUUID()}.mp3`);
  await fs.writeFile(voicePath, Buffer.from(arrayBuffer));
  return { voicePath, timestamps: [] as { word: string; start: number; end: number }[] };
}

export async function generateImage(prompt: string) {
  const key = await acquireKey("cloudflare");
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const model = process.env.CLOUDFLARE_MODEL || "@cf/black-forest-labs/flux-1-schnell";
    if (!accountId) throw new Error("CLOUDFLARE_ACCOUNT_ID missing");
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, width: 1080, height: 1920 }),
    });
    if (!res.ok) throw new Error(`cloudflare ${res.status}`);
    const imgPath = path.join(getAssetsDir(), `${randomUUID()}.png`);
    const buff = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(imgPath, buff);
    await reportKeyUsage("cloudflare", key.id, false);
    return imgPath;
  } catch (e) {
    await reportKeyUsage("cloudflare", key.id, true);
    throw e;
  }
}

export async function uploadCatbox(videoPath: string) {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", new Blob([await fs.readFile(videoPath)]), path.basename(videoPath));
  const res = await fetch("https://catbox.moe/user/api.php", { method: "POST", body: form });
  if (!res.ok) throw new Error(`catbox ${res.status}`);
  return (await res.text()).trim();
}

export async function publishFacebook(videoUrl: string, message: string, firstComment: string, pageId: string, token: string) {
  const videoRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_url: videoUrl, description: message, access_token: token }),
  });
  if (!videoRes.ok) throw new Error(`facebook video ${videoRes.status}`);
  const video = (await videoRes.json()) as { id: string };
  await fetch(`https://graph.facebook.com/v21.0/${video.id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: firstComment, access_token: token }),
  });
  return video.id;
}
