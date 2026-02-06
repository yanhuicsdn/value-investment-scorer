/**
 * 客户端股票数据获取工具
 * 在浏览器中直接调用第三方API，避免CORS和服务器端限制
 */

export interface StockRealtimeData {
  name: string;
  code: string;
  price: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
}

/**
 * 从新浪获取实时行情（客户端调用）
 */
export async function fetchSinaRealtimeData(code: string): Promise<StockRealtimeData | null> {
  try {
    // 标准化股票代码
    const normalizedCode = normalizeStockCode(code);
    const url = `https://hq.sinajs.cn/list=${normalizedCode}`;

    const response = await fetch(url);
    const text = await response.text();

    // 解析响应: var hq_str_sh600519="贵州茅台,1680.50,..."
    const match = text.match(/="([^"]+)"/);
    if (!match || !match[1]) {
      return null;
    }

    const parts = match[1].split(',');
    if (parts.length < 32 || !parts[0]) {
      return null;
    }

    const data: StockRealtimeData = {
      name: parts[0],
      code: normalizedCode,
      price: parseFloat(parts[3]),
      open: parseFloat(parts[1]),
      close: parseFloat(parts[2]),
      high: parseFloat(parts[4]),
      low: parseFloat(parts[5]),
      volume: parseInt(parts[8]),
      amount: parseFloat(parts[9]),
    };

    return data;
  } catch (error) {
    console.error('获取新浪数据失败:', error);
    return null;
  }
}

/**
 * 标准化股票代码
 */
function normalizeStockCode(code: string): string {
  code = code.trim().toUpperCase();

  // 如果已经有前缀，直接返回
  if (code.startsWith('SH') || code.startsWith('SZ')) {
    return code.toLowerCase();
  }

  // 上海证券交易所：6开头
  if (code.startsWith('6')) {
    return 'sh' + code;
  }

  // 深圳证券交易所：0或3开头
  if (code.startsWith('0') || code.startsWith('3')) {
    return 'sz' + code;
  }

  return code;
}

/**
 * 搜索股票（使用新浪搜索API）
 */
export async function searchStocks(keyword: string): Promise<SearchResult[]> {
  try {
    const url = `https://suggest3.sinajs.cn/suggest/type=11,12,13,14&key=${encodeURIComponent(keyword)}&name=suggestdata`;

    const response = await fetch(url);
    const text = await response.text();

    const match = text.match(/="([^"]+)"/);
    if (!match || !match[1]) {
      return [];
    }

    const results: SearchResult[] = [];
    const items = match[1].split(';');

    for (const item of items) {
      if (!item) continue;

      const codeMatch = item.match(/([a-z]{2}\d{6})(.+)/);
      if (codeMatch) {
        results.push({
          code: codeMatch[1],
          name: codeMatch[2],
        });
      }
    }

    return results.slice(0, 20);
  } catch (error) {
    console.error('搜索失败:', error);
    return [];
  }
}

interface SearchResult {
  code: string;
  name: string;
}

/**
 * 创建模拟的财务数据（当真实API不可用时）
 */
export function createMockFinancialData(stock: StockRealtimeData) {
  // 基于股价和名称生成估算的财务数据
  // 注意：这只是用于演示，真实数据应该从专业财经API获取

  const marketCap = stock.price * 1000000000; // 估算市值
  const totalShares = Math.round(marketCap / stock.price);

  return {
    stock_code: stock.code,
    company_name: stock.name,
    stock_price: stock.price,
    market_cap: marketCap,
    total_shares: totalShares,
    pe_ratio: 20 + Math.random() * 30, // 随机PE
    pb_ratio: 1 + Math.random() * 3, // 随机PB
    revenue: marketCap * 0.5, // 估算营收
    net_income: marketCap * 0.1, // 估算净利润
    operating_cash_flow: marketCap * 0.08,
    total_assets: marketCap * 1.5,
    total_liabilities: marketCap * 0.6,
    current_assets: marketCap * 0.8,
    current_liabilities: marketCap * 0.4,
    cash_equivalents: marketCap * 0.15,
    total_debt: marketCap * 0.2,
    ebit: marketCap * 0.12,
    roe: 10 + Math.random() * 15, // 随机ROE
    invested_capital: marketCap * 0.8,
    dividends_paid: marketCap * 0.03,
    goodwill: 0,
    intangible_assets: marketCap * 0.05,
    accounts_receivable: marketCap * 0.08,
    equity_multiplier: 1.5,
    adjusted_net_income: marketCap * 0.09,
  };
}
