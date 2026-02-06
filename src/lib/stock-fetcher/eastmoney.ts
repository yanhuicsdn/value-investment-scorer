import { StockFinancialData } from './types';
import { normalizeStockCode } from './sina';

/**
 * 东方财富网API - 获取财务数据
 */

/**
 * 从东方财富获取财务数据（主要财务指标）
 */
export async function fetchEastmoneyFinancialData(code: string, name: string): Promise<StockFinancialData | null> {
  try {
    const normalizedCode = normalizeStockCode(code);

    // 东方财富API：获取主要财务指标
    // API端点来自东方财富网页版
    const marketCode = normalizedCode.replace('sh', '0').replace('sz', '1');

    const apiUrl = `https://emweb.securities.eastmoney.com/PC_HSF10/NewFinanceAnalysis/ZYZBDateNew?type=web&code=${marketCode}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('东方财富API请求失败');
    }

    const data = await response.json();

    // 解析财务数据
    if (!data || !data.zyzbDateNew) {
      console.warn('未获取到财务数据');
      return null;
    }

    const reportData = data.zyzbDateNew;
    const latest = reportData[reportData.length - 1]; // 最新一期数据

    // 构建财务数据对象
    const financialData: StockFinancialData = {
      name: name,
      code: normalizedCode,
      // 市场数据（需要从实时数据获取，这里先给默认值）
      stock_price: 0,
      market_cap: 0,
      total_shares: 0,
      pe_ratio: latest.pe || 0,
      pb_ratio: latest.pb || 0,

      // 财务数据（单位通常为亿元，需要转换）
      revenue: latest.totaloperateincome ? parseFloat(latest.totaloperateincome) * 100000000 : 0,
      net_income: latest.parentnetprofit ? parseFloat(latest.parentnetprofit) * 100000000 : 0,
      operating_cash_flow: latest.jyxjxje ? parseFloat(latest.jyxjxje) * 100000000 : 0,
      total_assets: latest.totalassets ? parseFloat(latest.totalassets) * 100000000 : 0,
      total_liabilities: latest.totalliability ? parseFloat(latest.totalliability) * 100000000 : 0,
      current_assets: latest.totalcurrentassets ? parseFloat(latest.totalcurrentassets) * 100000000 : 0,
      current_liabilities: latest.totalcurrentliability ? parseFloat(latest.totalcurrentliability) * 100000000 : 0,
      cash_equivalents: latest.monetaryfund ? parseFloat(latest.monetaryfund) * 100000000 : 0,
      total_debt: latest.totalliability ? parseFloat(latest.totalliability) * 100000000 : 0,

      // 其他指标
      ebit: 0, // 需要计算
      roe: latest.roe ? parseFloat(latest.roe) : 0,
      invested_capital: 0, // 需要计算
      dividends_paid: 0, // 需要从其他接口获取
      goodwill: latest.goodwill ? parseFloat(latest.goodwill) * 100000000 : 0,
      intangible_assets: latest.intangibleassets ? parseFloat(latest.intangibleassets) * 100000000 : 0,
      accounts_receivable: latest.accountsreceivable ? parseFloat(latest.accountsreceivable) * 100000000 : 0,
      equity_multiplier: 0, // 需要计算
      adjusted_net_income: latest.parentnetprofit ? parseFloat(latest.parentnetprofit) * 100000000 : 0,
    };

    // 计算衍生指标
    if (financialData.total_assets > 0) {
      financialData.equity_multiplier = financialData.total_assets / (financialData.total_assets - financialData.total_liabilities);
    }

    return financialData;
  } catch (error) {
    console.error('获取东方财富财务数据失败:', error);
    return null;
  }
}

/**
 * 获取股票简况（包含市盈率、市净率等）
 */
export async function fetchEastmoneySummary(code: string): Promise<any | null> {
  try {
    const normalizedCode = normalizeStockCode(code);
    const marketCode = normalizedCode.replace('sh', '0').replace('sz', '1');

    const apiUrl = `https://push2.eastmoney.com/api/qt/stock/get?secid=${marketCode}&fields=f57,f58,f107,f116,f117,f127,f162,f163,f164,f165,f166,f167,f168,f169,f170,f171,f161,f49,f50,f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65,f66,f67,f68,f69,f70,f71,f72,f73,f74,f75,f76,f77,f78,f79,f80,f81,f82,f83,f84,f85,f86,f87,f88,f89,f90,f91,f92,f93,f94,f95,f126,f115,f152,f152,f252,f253,f254,f255,f256,f257,f258,f259,f260,f261,f262,f263,f264,f267,f268,f269,f270,f271,f273,f274,f275,f276,f277,f278,f279,f280,f281,f282,f283,f284,f285,f286,f287,f288,f289,f290,f291,f292,f293,f294,f295,f296,f297,f298,f299`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error('获取股票简况失败:', error);
    return null;
  }
}
