import { NextRequest, NextResponse } from "next/server";
import { HOT_STOCK_CATEGORIES, getRandomStocks, searchHotStocks } from "@/lib/stock-data/hot-stocks";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get("action");
    const categoryId = searchParams.get("categoryId");
    const keyword = searchParams.get("keyword");
    const count = parseInt(searchParams.get("count") || "10");

    // 获取所有分类
    if (action === "categories") {
      return NextResponse.json({
        success: true,
        categories: HOT_STOCK_CATEGORIES,
      });
    }

    // 获取随机推荐
    if (action === "random") {
      const stocks = getRandomStocks(count);
      return NextResponse.json({
        success: true,
        stocks,
      });
    }

    // 获取特定分类的股票
    if (action === "category" && categoryId) {
      const category = HOT_STOCK_CATEGORIES.find(cat => cat.id === categoryId);
      if (!category) {
        return NextResponse.json({ error: "分类不存在" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        category,
      });
    }

    // 搜索热门股票
    if (action === "search" && keyword) {
      const stocks = searchHotStocks(keyword);
      return NextResponse.json({
        success: true,
        stocks,
      });
    }

    // 默认返回所有分类
    return NextResponse.json({
      success: true,
      categories: HOT_STOCK_CATEGORIES,
    });
  } catch (error) {
    console.error("获取热门股票失败:", error);
    return NextResponse.json(
      { error: "获取数据失败" },
      { status: 500 }
    );
  }
}
