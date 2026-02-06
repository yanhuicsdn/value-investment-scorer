import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseCSVFile } from "@/lib/scoring";
import { scorer } from "@/lib/scoring";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const useMlWeights = formData.get("useMlWeights") === "true";

    if (!file) {
      return NextResponse.json({ error: "请上传CSV文件" }, { status: 400 });
    }

    // 解析CSV
    const stocks = await parseCSVFile(file);

    if (stocks.length === 0) {
      return NextResponse.json({ error: "CSV文件为空或格式错误" }, { status: 400 });
    }

    // 计算评分
    const results = scorer.calculateAllStocks(stocks, useMlWeights);

    // 保存到数据库（异步，不阻塞响应）
    const savePromises = results.map((result) =>
      prisma.scoringResult.create({
        data: {
          userId: session.user.id,
          stockCode: result.stockCode,
          stockName: result.stockName,
          totalScore: result.totalScore,
          maxScore: result.maxScore,
          scoreRatio: result.displayScore / result.displayMax,
          riskAdjustment: result.riskAdjustment,
          isIdeal: result.isIdeal,
          useMlWeights: result.useMlWeights,
          scores: JSON.stringify(result.scores),
          investmentAdvice: result.investmentAdvice,
        },
      })
    );

    // 等待保存完成
    await Promise.all(savePromises);

    // 按分数排序
    const sortedResults = results.sort((a, b) => b.displayScore - a.displayScore);

    return NextResponse.json({
      success: true,
      count: results.length,
      results: sortedResults,
    });
  } catch (error) {
    console.error("评分错误:", error);
    return NextResponse.json(
      { error: "评分失败: " + (error as Error).message },
      { status: 500 }
    );
  }
}
