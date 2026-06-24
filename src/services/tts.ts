interface TTSRequestBody {
  text: string;
  voiceId: string;
}

export async function textToSpeech(
  text: string,
  voiceId: string
): Promise<string> {
  const body: TTSRequestBody = { text, voiceId };
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("语音生成失败");
  }

  const data = await res.json();
  return data.audioUrl as string;
}
