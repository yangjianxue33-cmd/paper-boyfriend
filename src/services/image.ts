interface ImageRequestBody {
  scene: string;
  characterId: string;
}

export async function generateImage(
  scene: string,
  characterId: string
): Promise<string> {
  const body: ImageRequestBody = { scene, characterId };
  const res = await fetch("/api/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("图片生成失败");
  }

  const data = await res.json();
  return data.imageUrl as string;
}
