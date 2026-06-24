import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voiceId } = body;

    // TODO: 调用火山引擎 TTS API，替换为真实实现
    const mockResponse = {
      audioUrl: "",
      text,
      voiceId,
    };

    return NextResponse.json(mockResponse);
  } catch {
    return NextResponse.json(
      { error: "语音合成服务暂时不可用" },
      { status: 500 }
    );
  }
}
