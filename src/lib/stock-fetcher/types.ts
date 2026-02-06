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
  date: string;
  time: string;
}

export interface StockFinancialData {
  name: string;
  code: string;
  // 市场数据
  stock_price: number;
  market_cap: number;
  total_shares: number;
  pe_ratio: number;
  pb_ratio: number;
  // 财务数据
  revenue: number;
  net_income: number;
  operating_cash_flow: number;
  total_assets: number;
  total_liabilities: number;
  current_assets: number;
  current_liabilities: number;
  cash_equivalents: number;
  total_debt: number;
  ebit: number;
  roe: number;
  invested_capital: number;
  dividends_paid: number;
  goodwill: number;
  intangible_assets: number;
  accounts_receivable: number;
  equity_multiplier: number;
  adjusted_net_income: number;
}

export interface SearchResult {
  code: string;
  name: string;
  pinyin?: string;
}
