import { useCallback, useEffect, useRef, useState } from "react";

import { encodeWav } from "./wav";

/**
 * Voice capture as a first-class interaction.
 *
 * Two modes:
 *  - "quick": press and hold, release into one thought.
 *  - "session": tap once, ramble; the transcript is split afterwards.
 *
 * Path 1 (free, on-device): the browser's speech recognition, which also gives
 * live interim words.
 * Path 2 (fallback): capture PCM, encode a complete WAV, transcribe server-side.
 *
 * `level` is a smoothed 0..1 input level so the pulse ring can breathe with the
 * voice instead of jittering.
 */

export type VoiceMode = "quick" | "session";
export type VoiceState = "idle" | "listening" | "transcribing" | "error";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionResultEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: { isFinal: boolean; 0: { transcript: string } };
  };
};

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function speechRecognitionSupported() {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}

export function useVoiceCapture(options: {
  onComplete: (transcript: string, mode: VoiceMode) => void;
}) {
  const { onComplete } = options;
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<VoiceMode>("quick");

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const pcmRef = useRef<Float32Array[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef("");
  const rafRef = useRef(0);
  const usingRecognition = useRef(false);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  const teardown = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setLevel(0);
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    processorRef.current?.disconnect();
    processorRef.current = null;
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const ctx = ctxRef.current;
    ctxRef.current = null;
    if (ctx && ctx.state !== "closed") void ctx.close();
  }, []);

  useEffect(() => teardown, [teardown]);

  const start = useCallback(
    async (nextMode: VoiceMode) => {
      setError(null);
      setTranscript("");
      finalRef.current = "";
      pcmRef.current = [];
      setMode(nextMode);

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        setError("Avora needs microphone access to listen. You can always type instead.");
        setState("error");
        return;
      }
      streamRef.current = stream;

      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.85;
      source.connect(analyser);
      analyserRef.current = analyser;

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      let smoothed = 0;
      const readLevel = () => {
        analyser.getByteTimeDomainData(buffer);
        let peak = 0;
        for (const value of buffer) peak = Math.max(peak, Math.abs(value - 128) / 128);
        smoothed = smoothed * 0.82 + peak * 0.18;
        setLevel(Math.min(1, smoothed * 2.4));
        rafRef.current = requestAnimationFrame(readLevel);
      };
      rafRef.current = requestAnimationFrame(readLevel);

      const recognition = getRecognition();
      usingRecognition.current = Boolean(recognition);

      if (recognition) {
        recognition.lang = navigator.language || "en-US";
        recognition.continuous = nextMode === "session";
        recognition.interimResults = true;
        recognition.onresult = (event) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const result = event.results[i];
            if (!result) continue;
            if (result.isFinal) finalRef.current += `${result[0].transcript} `;
            else interim += result[0].transcript;
          }
          setTranscript(`${finalRef.current}${interim}`.replace(/\s+/g, " ").trimStart());
        };
        recognition.onerror = (event) => {
          if (event.error === "no-speech" || event.error === "aborted") return;
          setError("Speech recognition stumbled. Recording your words instead.");
        };
        recognitionRef.current = recognition;
        try {
          recognition.start();
        } catch {
          usingRecognition.current = false;
        }
      }

      if (!usingRecognition.current) {
        // Fallback: capture PCM for a complete WAV upload.
        const processor = ctx.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = (event) => {
          pcmRef.current.push(new Float32Array(event.inputBuffer.getChannelData(0)));
        };
        source.connect(processor);
        processor.connect(ctx.destination);
        processorRef.current = processor;
      }

      setState("listening");
    },
    [],
  );

  const stop = useCallback(async () => {
    if (state !== "listening") return;

    if (usingRecognition.current) {
      const text = `${finalRef.current} ${transcript}`
        .replace(/\s+/g, " ")
        .trim();
      teardown();
      setState("idle");
      const spoken = (finalRef.current.trim() || text).trim();
      if (spoken) completeRef.current(spoken, mode);
      else setError("Avora didn't catch that. Try again, or type it.");
      return;
    }

    const chunks = pcmRef.current;
    const sampleRate = ctxRef.current?.sampleRate ?? 48000;
    teardown();

    const blob = encodeWav(chunks, sampleRate);
    if (blob.size < 4096) {
      setState("idle");
      setError("That recording was empty — please try again.");
      return;
    }

    setState("transcribing");
    try {
      const form = new FormData();
      form.append("file", blob, "recording.wav");
      const response = await fetch("/api/transcribe", { method: "POST", body: form });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(detail || `Transcription failed (${response.status})`);
      }
      const payload = (await response.json()) as { text?: string };
      const text = (payload.text ?? "").trim();
      setState("idle");
      if (text) completeRef.current(text, mode);
      else setError("Avora didn't catch any words there.");
    } catch (caught) {
      console.error(caught);
      setState("error");
      setError(
        caught instanceof Error
          ? caught.message
          : "Avora couldn't transcribe that. Your words are safe — try typing.",
      );
    }
  }, [state, transcript, mode, teardown]);

  const cancel = useCallback(() => {
    teardown();
    pcmRef.current = [];
    finalRef.current = "";
    setTranscript("");
    setState("idle");
    setError(null);
  }, [teardown]);

  return { state, transcript, level, error, mode, start, stop, cancel };
}
