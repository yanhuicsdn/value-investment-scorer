import { StockRealtimeData, SearchResult } from './types';

/**
 * 新浪财经API - 获取实时行情
 * API文档: http://finance.sina.com.cn/sinafinanceteam/htmls/auth_service/auth_service_document.pdf
 */

const SINA_HQ_URL = 'https://hq.sinajs.cn/list=';

/**
 * 标准化股票代码
 * 600519 -> sh600519
 * 000001 -> sz000001
 */
export function normalizeStockCode(code: string): string {
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
 * 从新浪获取实时行情数据
 */
export async function fetchSinaRealtimeData(code: string): Promise<StockRealtimeData | null> {
  try {
    const normalizedCode = normalizeStockCode(code);
    const url = `${SINA_HQ_URL}${normalizedCode}`;

    const response = await fetch(url);
    const text = await response.text();

    // 解析响应: var hq_str_sh600519="贵州茅台,1680.50,..."
    const match = text.match(/="([^"]+)"/);
    if (!match || !match[1]) {
      return null;
    }

    const parts = match[1].split(',');
    if (parts.length < 32) {
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
      date: parts[30],
      time: parts[31],
    };

    return data;
  } catch (error) {
    console.error('获取新浪数据失败:', error);
    return null;
  }
}

/**
 * 新浪股票搜索API（模糊搜索）
 */
export async function searchSinaStocks(keyword: string): Promise<SearchResult[]> {
  try {
    // 新浪搜索接口
    const url = `https://suggest3.sinajs.cn/suggest/type=11,12,13,14&key=${encodeURIComponent(keyword)}&name=suggestdata`;

    const response = await fetch(url);
    const text = await response.text();

    // 解析响应: var suggestdata="sh600519贵州茅台,sh600516..."
    const match = text.match(/="([^"]+)"/);
    if (!match || !match[1]) {
      return [];
    }

    const results: SearchResult[] = [];
    const items = match[1].split(';');

    for (const item of items) {
      if (!item) continue;

      // 格式: sh600519贵州茅台
      const codeMatch = item.match(/([a-z]{2}\d{6})(.+)/);
      if (codeMatch) {
        results.push({
          code: codeMatch[1],
          name: codeMatch[2],
        });
      }
    }

    return results.slice(0, 20); // 限制返回20条
  } catch (error) {
    console.error('搜索失败:', error);
    return [];
  }
}

/**
 * 批量获取多只股票的实时数据
 */
export async function fetchMultipleSinaData(codes: string[]): Promise<StockRealtimeData[]> {
  const normalizedCodes = codes.map(normalizeStockCode);
  const url = `${SINA_HQ_URL}${normalizedCodes.join(',')}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    const results: StockRealtimeData[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const match = line.match(/="([^"]+)"/);
      if (match && match[1]) {
        const parts = match[1].split(',');
        if (parts.length >= 32 && parts[0]) {
          results.push({
            name: parts[0],
            code: line.match(/var hq_str_(.+)="/)?.[1] || '',
            price: parseFloat(parts[3]),
            open: parseFloat(parts[1]),
            close: parseFloat(parts[2]),
            high: parseFloat(parts[4]),
            low: parseFloat(parts[5]),
            volume: parseInt(parts[8]),
            amount: parseFloat(parts[9]),
            date: parts[30],
            time: parts[31],
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('批量获取失败:', error);
    return [];
  }
}
