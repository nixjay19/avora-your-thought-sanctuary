import { createFileRoute } from "@tanstack/react-router";

/**
 * Voice transcription fallback for browsers without on-device speech
 * recognition. This is the only server call in Avora's core loop, and it only
 * runs when the browser can't transcribe locally.
 */

const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED = new Set(["audio/wav", "audio/wave", "audio/x-wav", "audio/mpeg", "audio/mp4"]);

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response("Transcription is not configured.", { status: 500 });
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return new Response("Expected an audio upload.", { status: 400 });
        }

        const file = form.get("file");
        if (!(file instanceof File) || file.size === 0) {
          return new Response("No audio was received.", { status: 400 });
        }
        if (file.size > MAX_BYTES) {
          return new Response("That recording is too long to transcribe at once.", {
            status: 413,
          });
        }
        const mime = file.type.split(";")[0] ?? "";
        if (mime && !ALLOWED.has(mime)) {
          return new Response("That audio format isn't supported.", { status: 400 });
        }

        const upstream = new FormData();
        upstream.append("model", "openai/gpt-4o-mini-transcribe");
        upstream.append("file", file, "recording.wav");

        const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: upstream,
        });

        if (!response.ok) {
          const detail = await response.text().catch(() => "");
          return new Response(detail || "Transcription failed.", { status: response.status });
        }

        const payload = (await response.json()) as { text?: string };
        return Response.json({ text: payload.text ?? "" });
      },
    },
  },
});
