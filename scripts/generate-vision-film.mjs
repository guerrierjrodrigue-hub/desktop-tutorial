#!/usr/bin/env node
/**
 * Generates the AI b-roll clip(s) for the marketing "watch the film"
 * experience via Vercel AI Gateway (AI SDK experimental_generateVideo).
 * The model renders atmospheric motion footage only — no on-screen text or
 * the logo, since video models render legible text/logos unreliably. Those
 * stay code-rendered in FilmModal and are layered on top of this footage.
 *
 * Requires:
 *   - A Vercel Pro/Enterprise plan with AI Gateway enabled (paid usage)
 *   - AI_GATEWAY_API_KEY in .env.local (Vercel dashboard → AI Gateway → API Keys)
 *
 * Video generation takes several minutes per clip and costs real money —
 * this script only generates the CLIPS array below, so trim it while
 * testing style/quality before generating the full set.
 *
 * Usage: node --env-file=.env.local scripts/generate-vision-film.mjs
 */
import { experimental_generateVideo as generateVideo, createGateway } from "ai";
import { Agent } from "undici";
import fs from "node:fs";
import path from "node:path";

if (!process.env.AI_GATEWAY_API_KEY) {
  console.error(
    "Missing AI_GATEWAY_API_KEY.\n" +
      "Create one in the Vercel dashboard (Project → AI Gateway → API Keys), " +
      "add it to .env.local, then run: node --env-file=.env.local scripts/generate-vision-film.mjs",
  );
  process.exit(1);
}

const gateway = createGateway({
  fetch: (url, init) =>
    fetch(url, {
      ...init,
      dispatcher: new Agent({ headersTimeout: 15 * 60 * 1000, bodyTimeout: 15 * 60 * 1000 }),
    }),
});

const OUT_DIR = path.join(process.cwd(), "public", "videos");
fs.mkdirSync(OUT_DIR, { recursive: true });

const STYLE =
  "cinematic, warm golden-hour lighting, shallow depth of field, deep black " +
  "and crimson-gold color grade, slow motion, no on-screen text, no logos, no captions";

const CLIPS = [
  {
    file: "vision-training.mp4",
    prompt:
      `A Christian athlete training with quiet intensity at golden hour — lifting, running, ` +
      `stretching in a modest home gym touched by warm sunlight. ${STYLE}`,
  },
  {
    file: "vision-faith.mp4",
    prompt:
      `Close-up of hands open in prayer next to a worn Bible on a wooden table, soft warm light, ` +
      `then a slow reveal of a person pausing mid-workout to read a verse. ${STYLE}`,
  },
  {
    file: "vision-community.mp4",
    prompt:
      `A small group of diverse athletes training together outdoors at sunrise, encouraging each ` +
      `other, warm backlight, sense of unity and momentum. ${STYLE}`,
  },
];

for (const clip of CLIPS) {
  const outPath = path.join(OUT_DIR, clip.file);
  console.log(`Generating ${clip.file}...`);
  const result = await generateVideo({
    model: gateway.video("google/veo-3.1-generate-001"),
    prompt: clip.prompt,
    aspectRatio: "16:9",
    duration: 8,
  });
  fs.writeFileSync(outPath, result.videos[0].uint8Array);
  console.log(`Saved ${outPath}`);
}

console.log("Done.");
