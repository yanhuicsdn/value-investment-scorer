import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // 获取历史记录
    const [results, total] = await Promise.all([
      prisma.scoringResult.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.scoringResult.count({
        where: { userId: session.user.id },
      }),
    ]);

    // 解析scores JSON
    const parsedResults = results.map((result) => ({
      ...result,
      scores: JSON.parse(result.scores),
    }));

    return NextResponse.json({
      success: true,
      results: parsedResults,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("获取历史记录错误:", error);
    return NextResponse.json(
      { error: "获取历史记录失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少记录ID" }, { status: 400 });
    }

    // 验证所有权
    const result = await prisma.scoringResult.findUnique({
      where: { id },
    });

    if (!result || result.userId !== session.user.id) {
      return NextResponse.json({ error: "记录不存在或无权删除" }, { status: 404 });
    }

    await prisma.scoringResult.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除记录错误:", error);
    return NextResponse.json(
      { error: "删除失败" },
      { status: 500 }
    );
  }
}
