import { NextRequest, NextResponse } from "next/server";
import { stockFetcher } from "@/lib/stock-fetcher";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const keyword = searchParams.get("q");

    if (!keyword) {
      return NextResponse.json({ error: "请输入搜索关键词" }, { status: 400 });
    }

    const results = await stockFetcher.searchStocks(keyword);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("搜索失败:", error);
    return NextResponse.json(
      { error: "搜索失败" },
      { status: 500 }
    );
  }
}
