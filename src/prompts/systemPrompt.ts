import { Character, UserProfile } from "@/lib/types";

export function buildSystemPrompt(
  character: Character,
  userProfile: UserProfile
): string {
  const profileText = Object.entries(userProfile)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${key}: ${value.join(", ")}`;
      return `${key}: ${value}`;
    })
    .join("\n");

  return `
${character.systemPrompt}

用户画像：
${profileText || "（暂无）"}

要求：
1. 严格保持角色人设，不要 OOC；
2. 回复自然、有情感，避免机械感；
3. 每次回复控制在 100 字以内；
4. 如需发送图片，在回复末尾使用 [IMAGE: 场景描述]；
5. 如需询问用户画像，在回复末尾使用 [CHOICE: 问题内容 | 选项A | 选项B | 选项C]。
`.trim();
}
