import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const VOICE_ID = "pNInz6obpgDQGcFmaJgB";

export const synthesize = async (text: string, outputPath: string): Promise<string> => {
  const audio = await elevenlabs.textToSpeech.convert(VOICE_ID, {
    text,
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
  });

  const chunks: Uint8Array[] = [];
  for await (const chunk of audio) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  await Bun.write(outputPath, buffer);

  return outputPath;
};
