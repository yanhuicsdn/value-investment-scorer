import { fetchSinaRealtimeData, fetchMultipleSinaData, searchSinaStocks } from './sina';
import { fetchEastmoneyFinancialData, fetchEastmoneySummary } from './eastmoney';
import { StockFinancialData, SearchResult } from './types';

export class StockDataFetcher {
  /**
   * 搜索股票
   */
  async searchStocks(keyword: string): Promise<SearchResult[]> {
    return searchSinaStocks(keyword);
  }

  /**
   * 获取单只股票的完整数据（用于评分）
   */
  async fetchStockFinancialData(code: string): Promise<StockFinancialData | null> {
    try {
      // 1. 从新浪获取实时行情（获取股票名称和价格）
      const realtimeData = await fetchSinaRealtimeData(code);
      if (!realtimeData) {
        throw new Error('未找到该股票');
      }

      // 2. 从东方财富获取财务数据
      const financialData = await fetchEastmoneyFinancialData(code, realtimeData.name);
      if (!financialData) {
        throw new Error('获取财务数据失败');
      }

      // 3. 合并实时价格数据
      financialData.stock_price = realtimeData.price;
      financialData.name = realtimeData.name;

      // 4. 计算市值（如果还没有）
      if (financialData.total_shares && !financialData.market_cap) {
        financialData.market_cap = financialData.total_shares * realtimeData.price;
      }

      return financialData;
    } catch (error) {
      console.error('获取股票数据失败:', error);
      return null;
    }
  }

  /**
   * 批量获取股票实时数据
   */
  async fetchMultipleStocks(codes: string[]): Promise<any[]> {
    return fetchMultipleSinaData(codes);
  }

  /**
   * 获取单只股票实时行情
   */
  async fetchRealtimeData(code: string) {
    return fetchSinaRealtimeData(code);
  }
}

// 默认实例
export const stockFetcher = new StockDataFetcher();

// 重新导出类型和工具函数
export * from './types';
export * from './sina';
export * from './eastmoney';
