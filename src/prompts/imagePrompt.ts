import { Character } from "@/lib/types";

export function optimizeImagePrompt(
  scene: string,
  character: Character
): string {
  return `
一位年轻男性，${character.occupation}，${character.personality.join(", ")}，
场景：${scene}，
电影感，高质量，温暖氛围，亚洲面孔，半身或全身照。
`.trim();
}
