import { NextRequest, NextResponse } from "next/server";
import { stockFetcher } from "@/lib/stock-fetcher";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "请提供股票代码" }, { status: 400 });
    }

    const data = await stockFetcher.fetchStockFinancialData(code);

    if (!data) {
      return NextResponse.json({ error: "未找到该股票数据" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("获取股票数据失败:", error);
    return NextResponse.json(
      { error: "获取数据失败: " + (error as Error).message },
      { status: 500 }
    );
  }
}
