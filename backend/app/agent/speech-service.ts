const UNREAL_SPEECH_URL = "https://api.v8.unrealspeech.com/speech";
const VOICE_ID = "am_adam";

export const synthesize = async (text: string, outputPath: string): Promise<string> => {
  const res = await fetch(UNREAL_SPEECH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UNREAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Text: text,
      VoiceId: VOICE_ID,
      Bitrate: "192k",
      Speed: "0",
      Pitch: "1",
      TimestampType: "sentence",
    }),
  });

  if (!res.ok) {
    throw new Error(`Unreal Speech error: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { OutputUri: string };
  const audioRes = await fetch(data.OutputUri);
  await Bun.write(outputPath, await audioRes.arrayBuffer());

  return outputPath;
};
