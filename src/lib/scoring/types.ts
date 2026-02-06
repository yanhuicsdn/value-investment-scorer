export interface StockData {
  stock_code?: string;
  company_name?: string;
  stock_name?: string;
  stock_price?: number | null;
  market_cap?: number | null;
  total_shares?: number | null;
  pe_ratio?: number | null;
  pb_ratio?: number | null;
  ebit?: number | null;
  net_income?: number | null;
  invested_capital?: number | null;
  tax_rate?: number | null;
  total_debt?: number | null;
  total_liabilities?: number | null;
  interest_expense?: number | null;
  current_assets?: number | null;
  current_liabilities?: number | null;
  cash_equivalents?: number | null;
  short_term_investments?: number | null;
  operating_cash_flow?: number | null;
  total_assets?: number | null;
  revenue?: number | null;
  adjusted_net_income?: number | null;
  beginning_book_value_per_share?: number | null;
  ending_book_value_per_share?: number | null;
  retained_earnings?: number | null;
  roe?: number | null;
  equity_multiplier?: number | null;
  dividends_paid?: number | null;
  share_repurchases?: number | null;
  goodwill?: number | null;
  intangible_assets?: number | null;
  trading_securities?: number | null;
  accounts_receivable?: number | null;
}

export interface ScoreDetail {
  name: string;
  score: number;
  maxScore: number;
  passed: boolean;
  detail: string;
}

export interface ScoringResult {
  stockCode: string;
  stockName: string;
  scores: Record<string, ScoreDetail>;
  totalScore: number;
  maxScore: number;
  riskAdjustment: number;
  isIdeal: boolean;
  useMlWeights: boolean;
  weightedTotal?: number;
  displayScore: number;
  displayScoreType: string;
  displayMax: number;
  investmentAdvice: string;
}
