const BASE_URL = "https://api.assemblyai.com";

interface AssemblyWord {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

async function assemblyFetch(path: string, options: RequestInit): Promise<Response> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      authorization: process.env.ASSEMBLY_API_KEY ?? "",
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`AssemblyAI ${path} failed: ${res.status}`);
  return res;
}

async function uploadAudio(filePath: string): Promise<string> {
  const file = Bun.file(filePath);
  const buffer = await file.arrayBuffer();

  const res = await assemblyFetch("/v2/upload", {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: buffer,
  });

  const { upload_url } = (await res.json()) as { upload_url: string };
  return upload_url;
}

async function pollTranscript(transcriptId: string): Promise<WordTimestamp[]> {
  while (true) {
    const res = await assemblyFetch(`/v2/transcript/${transcriptId}`, { method: "GET" });
    const result = (await res.json()) as {
      status: string;
      error?: string;
      words?: AssemblyWord[];
    };

    if (result.status === "completed") {
      return (result.words ?? []).map(({ text, start, end, confidence }) => ({
        word: text,
        start,
        end,
        confidence,
      }));
    }
    if (result.status === "error") throw new Error(`Transcription failed: ${result.error}`);

    await Bun.sleep(3000);
  }
}

export async function getWordTimestamps(audioFilePath: string): Promise<WordTimestamp[]> {
  const audioUrl = await uploadAudio(audioFilePath);

  const res = await assemblyFetch("/v2/transcript", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audio_url: audioUrl }),
  });

  const { id } = (await res.json()) as { id: string };
  return pollTranscript(id);
}
