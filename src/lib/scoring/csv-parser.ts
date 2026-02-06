import Papa from 'papaparse';
import { StockData } from './types';

// 中英文列名映射
const COLUMN_MAPPING: Record<string, string> = {
  "公司名称": "company_name",
  "当前股价": "stock_price",
  "市值": "market_cap",
  "总股本": "total_shares",
  "市盈率(P/E)": "pe_ratio",
  "市净率(P/B)": "pb_ratio",
  "息税前利润(EBIT)": "ebit",
  "净利润": "net_income",
  "投入资本": "invested_capital",
  "税率": "tax_rate",
  "总债务": "total_debt",
  "总负债": "total_liabilities",
  "利息费用": "interest_expense",
  "流动资产": "current_assets",
  "流动负债": "current_liabilities",
  "现金及现金等价物": "cash_equivalents",
  "短期投资": "short_term_investments",
  "经营现金流": "operating_cash_flow",
  "总资产": "total_assets",
  "营业收入": "revenue",
  "营收": "revenue",
  "扣除非经常性损益后净利润": "adjusted_net_income",
  "期初每股净资产": "beginning_book_value_per_share",
  "期末每股净资产": "ending_book_value_per_share",
  "累计未分配利润": "retained_earnings",
  "净资产收益率": "roe",
  "权益乘数": "equity_multiplier",
  "年度分红": "dividends_paid",
  "股票回购金额": "share_repurchases",
  "商誉": "goodwill",
  "无形资产": "intangible_assets",
  "交易性金融资产": "trading_securities",
  "应收账款": "accounts_receivable",
};

/**
 * 解析CSV文件并转换为StockData数组
 */
export async function parseCSVFile(file: File): Promise<StockData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const stocks = results.data.map((row: any) => normalizeRow(row));
          resolve(stocks);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * 标准化列名并转换数据类型
 */
function normalizeRow(row: Record<string, any>): StockData {
  const normalized: any = {};

  for (const [columnName, value] of Object.entries(row)) {
    // 映射列名
    const mappedName = COLUMN_MAPPING[columnName] || columnName;

    // 转换数值：移除千分位逗号，转换为数字
    let numValue: number | null = null;
    if (value !== null && value !== undefined && value !== '') {
      const strValue = String(value).replace(/,/g, '');
      numValue = parseFloat(strValue);
      if (isNaN(numValue)) {
        numValue = null;
      }
    }

    normalized[mappedName] = numValue;
  }

  return normalized as StockData;
}

/**
 * 将CSV文本转换为StockData数组
 */
export function parseCSVText(csvText: string): StockData[] {
  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return results.data.map((row: any) => normalizeRow(row));
}
