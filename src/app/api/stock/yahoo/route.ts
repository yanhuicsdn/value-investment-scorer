import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { prisma } from "@/lib/prisma";

const yahooFinance = new YahooFinance();

// 缓存有效期：24小时（单位：小时）
const CACHE_HOURS = 24;

/**
 * 从雅虎财经获取股票财务数据（带数据库缓存）
 * 支持A股：上海交易所(.SS) 和 深圳交易所(.SZ)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const forceRefresh = searchParams.get("refresh") === "true"; // 强制刷新

    if (!code) {
      return NextResponse.json({ error: "请提供股票代码" }, { status: 400 });
    }

    // 统一股票代码格式（移除 sh/sz 前缀，统一小写）
    const normalizedCode = code.toLowerCase().replace(/^sh/i, "").replace(/^sz/i, "");

    console.log(`📊 获取股票数据: ${normalizedCode}`);

    // 1. 先检查数据库缓存（除非强制刷新）
    if (!forceRefresh) {
      const cached = await prisma.stockData.findUnique({
        where: { stockCode: normalizedCode }
      });

      if (cached) {
        // 检查数据是否在有效期内
        const hoursSinceUpdate = (Date.now() - cached.updatedAt.getTime()) / (1000 * 60 * 60);

        if (hoursSinceUpdate < CACHE_HOURS) {
          console.log(`✅ 使用缓存数据 (${hoursSinceUpdate.toFixed(1)}小时前更新)`);

          // 返回缓存的 JSON 数据
          const cachedData = JSON.parse(cached.rawData);
          return NextResponse.json(cachedData);
        } else {
          console.log(`⏰ 缓存已过期 (${hoursSinceUpdate.toFixed(1)}小时前)，重新获取...`);
        }
      } else {
        console.log(`🔍 数据库中无此股票，从雅虎财经获取...`);
      }
    } else {
      console.log(`🔄 强制刷新模式，从雅虎财经获取...`);
    }

    // 2. 从雅虎财经获取数据
    const yahooCode = convertToYahooCode(normalizedCode);
    console.log(`正在从雅虎财经获取: ${yahooCode}`);

    // 获取基本报价信息
    const quote = await yahooFinance.quote(yahooCode);
    console.log("获取报价信息成功");

    // 获取详细财务数据
    const quoteSummary = await yahooFinance.quoteSummary(yahooCode, {
      modules: [
        "price",
        "summaryDetail",
        "financialData",
        "defaultKeyStatistics",
      ],
    });
    console.log("获取基础财务数据成功");

    // 转换为我们的财务数据格式
    const financialData = transformYahooData(quote, quoteSummary, normalizedCode);

    // 3. 保存到数据库
    await saveToDatabase(normalizedCode, financialData);
    console.log("💾 数据已保存到数据库");

    return NextResponse.json(financialData);
  } catch (error: any) {
    console.error("获取雅虎财经数据失败:", error.message);

    // 如果 API 失败，尝试返回缓存数据（即使过期）
    const normalizedCode = request.nextUrl.searchParams.get("code")?.toLowerCase()
      .replace(/^sh/i, "").replace(/^sz/i, "");

    if (normalizedCode) {
      const cached = await prisma.stockData.findUnique({
        where: { stockCode: normalizedCode }
      });

      if (cached) {
        console.log("⚠️ API失败，使用过期缓存数据");
        const cachedData = JSON.parse(cached.rawData);
        return NextResponse.json({
          ...cachedData,
          _cached: true,
          _cacheAge: `${((Date.now() - cached.updatedAt.getTime()) / (1000 * 60 * 60)).toFixed(1)}h`
        });
      }
    }

    return NextResponse.json(
      { error: `获取数据失败: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * 保存股票数据到数据库
 */
async function saveToDatabase(stockCode: string, data: any) {
  await prisma.stockData.upsert({
    where: { stockCode },
    update: {
      stockName: data.company_name || data.stock_name || "Unknown",
      stockPrice: data.stock_price || 0,
      marketCap: data.market_cap || 0,
      totalShares: data.total_shares || 0,
      peRatio: data.pe_ratio || 0,
      pbRatio: data.pb_ratio || 0,
      revenue: data.revenue || 0,
      netIncome: data.net_income || 0,
      ebit: data.ebit || 0,
      operatingCashFlow: data.operating_cash_flow || 0,
      totalAssets: data.total_assets || 0,
      totalLiabilities: data.total_liabilities || 0,
      currentAssets: data.current_assets || 0,
      currentLiabilities: data.current_liabilities || 0,
      cashEquivalents: data.cash_equivalents || 0,
      totalDebt: data.total_debt || 0,
      investedCapital: data.invested_capital || 0,
      roe: data.roe || 0,
      equityMultiplier: data.equity_multiplier || 0,
      dividendsPaid: data.dividends_paid || 0,
      goodwill: data.goodwill || 0,
      intangibleAssets: data.intangible_assets || 0,
      accountsReceivable: data.accounts_receivable || 0,
      adjustedNetIncome: data.adjusted_net_income || 0,
      rawData: JSON.stringify(data),
      dataSource: "yahoo",
    },
    create: {
      stockCode,
      stockName: data.company_name || data.stock_name || "Unknown",
      stockPrice: data.stock_price || 0,
      marketCap: data.market_cap || 0,
      totalShares: data.total_shares || 0,
      peRatio: data.pe_ratio || 0,
      pbRatio: data.pb_ratio || 0,
      revenue: data.revenue || 0,
      netIncome: data.net_income || 0,
      ebit: data.ebit || 0,
      operatingCashFlow: data.operating_cash_flow || 0,
      totalAssets: data.total_assets || 0,
      totalLiabilities: data.total_liabilities || 0,
      currentAssets: data.current_assets || 0,
      currentLiabilities: data.current_liabilities || 0,
      cashEquivalents: data.cash_equivalents || 0,
      totalDebt: data.total_debt || 0,
      investedCapital: data.invested_capital || 0,
      roe: data.roe || 0,
      equityMultiplier: data.equity_multiplier || 0,
      dividendsPaid: data.dividends_paid || 0,
      goodwill: data.goodwill || 0,
      intangibleAssets: data.intangible_assets || 0,
      accountsReceivable: data.accounts_receivable || 0,
      adjustedNetIncome: data.adjusted_net_income || 0,
      rawData: JSON.stringify(data),
      dataSource: "yahoo",
    },
  });
}

/**
 * 转换股票代码为雅虎财经格式
 */
function convertToYahooCode(code: string): string {
  code = code.trim().toUpperCase();

  // 如果已经是雅虎格式，直接返回
  if (code.endsWith(".SS") || code.endsWith(".SZ")) {
    return code;
  }

  // 移除可能存在的sh/sz前缀
  code = code.replace(/^SH/i, "").replace(/^SZ/i, "");

  // 上海证券交易所：6开头
  if (code.startsWith("6")) {
    return `${code}.SS`;
  }

  // 深圳证券交易所：0或3开头
  if (code.startsWith("0") || code.startsWith("3")) {
    return `${code}.SZ`;
  }

  return code;
}

/**
 * 转换雅虎财经数据为我们的评分系统格式
 * 使用确定性估算（无随机因素），确保同一股票每次评分结果一致
 */
function transformYahooData(
  quote: any,
  quoteSummary: any,
  originalCode: string
): any {
  const price = quote.regularMarketPrice || 0;
  const financialData = quoteSummary.financialData || {};
  const summaryDetail = quoteSummary.summaryDetail || {};
  const defaultKeyStats = quoteSummary.defaultKeyStatistics || {};

  // 市值（单位：元）
  const marketCap = quote.marketCap || 0;

  // 从雅虎财经获取的真实数据
  const pe_ratio = summaryDetail.trailingPE || financialData.trailingPE || 0;
  const pb_ratio = summaryDetail.priceToBook || defaultKeyStats.priceToBook || 0;
  const roe = financialData.returnOnEquity || 0;
  const total_debt = financialData.totalDebt || 0;

  // ===== 使用确定性估算（基于行业平均值的固定参数） =====

  // 1. 从PB推算净资产：净资产 = 市值 / PB
  const shareholders_equity = pb_ratio > 0 ? marketCap / pb_ratio : marketCap * 0.4;

  // 2. 从ROE推算净利润：净利润 = 净资产 × ROE
  const net_income = roe > 0 ? shareholders_equity * roe : marketCap * 0.1;

  // 3. 从PE推算净利润（备用）：净利润 = 市值 / PE
  const net_income_from_pe = pe_ratio > 0 ? marketCap / pe_ratio : 0;

  // 使用两种方法中较大的值（更保守）
  const estimated_net_income = Math.max(net_income, net_income_from_pe);

  // 4. 估算营收（使用固定净利润率 20%，而非随机）
  const profit_margin = 0.2; // 固定行业平均
  const revenue = estimated_net_income / profit_margin;

  // 5. 从资产结构推算总资产（使用固定资产负债率 45%）
  const debt_ratio = 0.45; // A股平均
  const total_liabilities = shareholders_equity * (debt_ratio / (1 - debt_ratio));
  const total_assets = shareholders_equity + total_liabilities;

  // 6. 流动资产/流动负债（使用固定流动比率 1.5）
  const current_ratio = 1.5;
  const current_liabilities = total_liabilities * 0.5;
  const current_assets = current_liabilities * current_ratio;

  // 7. 现金及等价物（固定占流动资产 22%）
  const cash_equivalents = current_assets * 0.22;

  // 8. EBIT（息税前利润，假设税率 20%）
  const ebit = estimated_net_income * 1.25;

  // 9. 经营现金流（固定为净利润的 1.2 倍）
  const operating_cash_flow = estimated_net_income * 1.2;

  // 10. 投入资本
  const invested_capital = shareholders_equity + total_debt;

  // 11. 股息支付（固定股息率 2%）
  const dividend_yield = 0.02;
  const dividends_paid = marketCap * dividend_yield;

  // 12. 无形资产和商誉（固定比例）
  const goodwill = total_assets * 0.02;
  const intangible_assets = total_assets * 0.03;

  // 13. 应收账款（固定占营收 10%）
  const accounts_receivable = revenue * 0.1;

  // 14. 权益乘数
  const equity_multiplier = total_assets / shareholders_equity;

  return {
    stock_code: originalCode,
    company_name: quote.longName || quote.shortName || "Unknown",

    // 价格相关（真实数据）
    stock_price: price,
    market_cap: marketCap,
    total_shares: marketCap > 0 ? Math.round(marketCap / price) : 0,

    // 估值指标（真实数据）
    pe_ratio: pe_ratio,
    pb_ratio: pb_ratio,

    // 利润表数据（基于真实PE/PB/ROE的确定性估算）
    revenue: revenue,
    net_income: estimated_net_income,
    ebit: ebit,

    // 现金流量（确定性估算）
    operating_cash_flow: operating_cash_flow,

    // 资产负债表（基于真实PB推算）
    total_assets: total_assets,
    total_liabilities: total_liabilities,
    current_assets: current_assets,
    current_liabilities: current_liabilities,
    cash_equivalents: cash_equivalents,

    // 财务比率（真实数据）
    roe: roe,
    total_debt: total_debt,
    invested_capital: invested_capital,

    // 股息（确定性估算）
    dividends_paid: dividends_paid,

    // 无形资产（确定性估算）
    goodwill: goodwill,
    intangible_assets: intangible_assets,

    // 应收账款（确定性估算）
    accounts_receivable: accounts_receivable,

    // 计算值
    equity_multiplier: equity_multiplier,
    adjusted_net_income: estimated_net_income * 0.95,
  };
}
