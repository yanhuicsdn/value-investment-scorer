import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

/**
 * 使用雅虎财经搜索股票
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get("q");

    if (!keyword) {
      return NextResponse.json({ error: "请提供搜索关键词" }, { status: 400 });
    }

    console.log(`搜索股票: ${keyword}`);

    // 使用雅虎财经搜索
    const searchResult = await yahooFinance.search(keyword);

    // 过滤出A股相关的结果
    // 上海交易所：.SS 结尾
    // 深圳交易所：.SZ 结尾
    const chinaStocks = searchResult.quotes
      .filter((quote: any) => {
        const symbol = quote.symbol || "";
        return (
          symbol.endsWith(".SS") ||
          symbol.endsWith(".SZ") ||
          symbol.includes(".SS") ||
          symbol.includes(".SZ")
        );
      })
      .map((quote: any) => ({
        code: quote.symbol,
        name: quote.longName || quote.shortName || quote.symbol,
        exchange: quote.exchange,
        type: quote.quoteType,
      }))
      .slice(0, 10); // 限制返回10条结果

    console.log(`找到 ${chinaStocks.length} 只A股`);

    return NextResponse.json({
      results: chinaStocks,
      total: chinaStocks.length,
    });
  } catch (error: any) {
    console.error("搜索失败:", error.message);
    return NextResponse.json(
      { error: `搜索失败: ${error.message}` },
      { status: 500 }
    );
  }
}
