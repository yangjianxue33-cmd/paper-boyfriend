import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scene, characterId } = body;

    // TODO: 调用火山引擎图像生成 API，替换为真实实现
    const mockResponse = {
      imageUrl: "",
      scene,
      characterId,
    };

    return NextResponse.json(mockResponse);
  } catch {
    return NextResponse.json(
      { error: "图像生成服务暂时不可用" },
      { status: 500 }
    );
  }
}
