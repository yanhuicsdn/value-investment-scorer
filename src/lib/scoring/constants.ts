export const SCORE_RULES = {
  // 安全边际指标（60分）
  valuation_safety: { name: "估值合理性(PEG+PB)", score: 15, category: "safety" },
  debt_safety: { name: "负债安全性", score: 15, category: "safety" },
  liquidity_safety: { name: "流动性安全边际", score: 10, category: "safety" },
  cash_safety: { name: "现金安全边际(净现金/市值)", score: 10, category: "safety" },
  asset_safety: { name: "资产安全性(NCAV)", score: 10, category: "safety" },

  // 公司质量指标（92分）
  profit_quality: { name: "盈利质量(现金比率+核心占比)", score: 15, category: "quality" },
  roic_quality: { name: "资本回报率(ROIC)", score: 12, category: "quality" },
  low_leverage_roe: { name: "去杠杆后ROE", score: 12, category: "quality" },
  pr_ratio: { name: "市赚率(PR)", score: 12, category: "quality" },
  tangible_pb: { name: "有形市净率", score: 10, category: "quality" },
  capital_discipline: { name: "资本配置纪律", score: 7, category: "quality" },
  cash_flow_stability: { name: "现金流稳定性(财报操纵检测)", score: 12, category: "quality" },

  // 股东回报指标（25分）
  dividend_yield: { name: "股息收益率", score: 8, category: "shareholder" },
  total_payout_yield: { name: "总股东回报率(分红+回购)", score: 8, category: "shareholder" },
  sustainable_growth: { name: "可持续增长率", score: 9, category: "shareholder" },

  // 风险调整（扣分项）
  financial_risk: { name: "财务风险调整(商誉/应收账款/资不抵债)", score: 0, category: "risk" },
} as const;

// ML学习到的权重数据（通过机器学习回测A股数据得到）
export const ML_WEIGHTS_RAW = {
  valuation_safety: 0.294733768,
  pr_ratio: 0.184490614,
  tangible_pb: 0.137035663,
  roic_quality: 0.10579863,
  sustainable_growth: 0.063315856,
  low_leverage_roe: 0.043204819,
  profit_quality: 0.038070852,
  debt_safety: 0.037992177,
  dividend_yield: 0.035612579,
  capital_discipline: 0.025102945,
  cash_safety: 0.020319862,
  liquidity_safety: 0.005547219,
  cash_flow_stability: 0.005459012,
  total_payout_yield: 0.00302665,
  asset_safety: 0.000289355,
};

// 归一化ML权重
export const ML_WEIGHTS = normalizeWeights(ML_WEIGHTS_RAW);

function normalizeWeights(weights: Record<string, number>): Record<string, number> {
  const total = Object.values(weights).reduce((sum, v) => sum + v, 0);
  if (total === 0) return { ...weights };
  return Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, v / total])
  );
}
