import { StockData, ScoreDetail } from './types';

// 辅助函数：安全获取数值
function safeNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined || isNaN(value)) return null;
  return value;
}

// 1. 估值合理性得分（15分）
export function calculateValuationSafety(stock: StockData): ScoreDetail {
  try {
    const peRatio = safeNumber(stock.pe_ratio);
    const pbRatio = safeNumber(stock.pb_ratio);
    const roe = safeNumber(stock.roe);

    if (!peRatio || !pbRatio) {
      return { name: "估值合理性(PEG+PB)", score: 0, maxScore: 15, passed: false, detail: "数据缺失" };
    }

    // P/E 打分（0-6分）
    let peScore = 0;
    let peDesc = "";
    if (peRatio <= 10) { peScore = 6; peDesc = "优秀(≤10)"; }
    else if (peRatio <= 15) { peScore = 5; peDesc = "良好(10-15)"; }
    else if (peRatio <= 20) { peScore = 3; peDesc = "一般(15-20)"; }
    else if (peRatio <= 30) { peScore = 1; peDesc = "偏高(20-30)"; }
    else { peScore = 0; peDesc = "过高(>30)"; }

    // P/B 打分（0-6分）
    let pbScore = 0;
    let pbDesc = "";
    if (pbRatio <= 0.8) { pbScore = 6; pbDesc = "深度价值(≤0.8)"; }
    else if (pbRatio <= 1.2) { pbScore = 5; pbDesc = "合理(0.8-1.2)"; }
    else if (pbRatio <= 2.0) { pbScore = 2; pbDesc = "偏高(1.2-2.0)"; }
    else { pbScore = 0; pbDesc = "过高(>2.0)"; }

    // PEG 概念（0-3分）
    let pegScore = 0;
    let pegDesc = "";
    if (roe && roe > 0) {
      const peg = peRatio / roe;
      if (peg <= 1.0) { pegScore = 3; pegDesc = `PEG=${peg.toFixed(2)}(优秀)`; }
      else if (peg <= 1.5) { pegScore = 2; pegDesc = `PEG=${peg.toFixed(2)}(良好)`; }
      else { pegScore = 1; pegDesc = `PEG=${peg.toFixed(2)}(一般)`; }
    } else {
      pegDesc = "ROE数据缺失";
    }

    const totalScore = peScore + pbScore + pegScore;
    return {
      name: "估值合理性(PEG+PB)",
      score: totalScore,
      maxScore: 15,
      passed: totalScore >= 10,
      detail: `P/E:${peDesc}, P/B:${pbDesc}, ${pegDesc}, 总分:${totalScore.toFixed(1)}`
    };
  } catch (e) {
    return { name: "估值合理性(PEG+PB)", score: 0, maxScore: 15, passed: false, detail: "数据缺失" };
  }
}

// 2. 负债安全性得分（15分）
export function calculateDebtSafety(stock: StockData): ScoreDetail {
  try {
    const totalLiabilities = safeNumber(stock.total_liabilities);
    const totalAssets = safeNumber(stock.total_assets);
    const totalDebt = safeNumber(stock.total_debt);
    const currentAssets = safeNumber(stock.current_assets);
    const currentLiabilities = safeNumber(stock.current_liabilities);

    if (!totalLiabilities || !totalAssets) {
      return { name: "负债安全性", score: 0, maxScore: 15, passed: false, detail: "数据缺失" };
    }

    // 资产负债率打分（0-10分）
    const debtRatio = (totalLiabilities / totalAssets) * 100;
    let drScore = 0;
    let drDesc = "";
    if (debtRatio <= 30) { drScore = 10; drDesc = `资产负债率=${debtRatio.toFixed(1)}%(极低)`; }
    else if (debtRatio <= 50) { drScore = 8; drDesc = `资产负债率=${debtRatio.toFixed(1)}%(健康)`; }
    else if (debtRatio <= 65) { drScore = 4; drDesc = `资产负债率=${debtRatio.toFixed(1)}%(偏高)`; }
    else if (debtRatio <= 80) { drScore = 1; drDesc = `资产负债率=${debtRatio.toFixed(1)}%(较高)`; }
    else { drScore = 0; drDesc = `资产负债率=${debtRatio.toFixed(1)}%(过高)`; }

    // 债务/净流动资产打分（0-5分）
    let ncaScore = 0;
    let ncaDesc = "数据缺失";
    if (totalDebt && currentAssets && currentLiabilities) {
      const netCurrentAssets = currentAssets - currentLiabilities;
      if (netCurrentAssets > 0) {
        const debtNca = totalDebt / netCurrentAssets;
        if (debtNca <= 0.5) { ncaScore = 5; ncaDesc = `债务/净流动资产=${debtNca.toFixed(2)}(安全)`; }
        else if (debtNca <= 1.0) { ncaScore = 3; ncaDesc = `债务/净流动资产=${debtNca.toFixed(2)}(尚可)`; }
        else if (debtNca <= 2.0) { ncaScore = 1; ncaDesc = `债务/净流动资产=${debtNca.toFixed(2)}(偏高)`; }
        else { ncaScore = 0; ncaDesc = `债务/净流动资产=${debtNca.toFixed(2)}(过高)`; }
      } else {
        ncaDesc = "净流动资产为负";
      }
    }

    const totalScore = drScore + ncaScore;
    return {
      name: "负债安全性",
      score: totalScore,
      maxScore: 15,
      passed: totalScore >= 10,
      detail: `${drDesc}, ${ncaDesc}, 总分:${totalScore.toFixed(1)}`
    };
  } catch (e) {
    return { name: "负债安全性", score: 0, maxScore: 15, passed: false, detail: "数据缺失" };
  }
}

// 3. 流动性安全边际得分（10分）
export function calculateLiquiditySafety(stock: StockData): ScoreDetail {
  try {
    const currentAssets = safeNumber(stock.current_assets);
    const currentLiabilities = safeNumber(stock.current_liabilities);

    if (!currentAssets || !currentLiabilities) {
      return { name: "流动性安全边际", score: 0, maxScore: 10, passed: false, detail: "数据缺失" };
    }

    const currentRatio = currentAssets / currentLiabilities;
    let score = 0;
    let passed = false;
    let detail = "";

    if (currentRatio >= 2.0) { score = 10; passed = true; detail = `流动比率=${currentRatio.toFixed(2)}(优秀≥2.0)`; }
    else if (currentRatio >= 1.5) { score = 7; passed = true; detail = `流动比率=${currentRatio.toFixed(2)}(良好1.5-2.0)`; }
    else if (currentRatio >= 1.0) { score = 4; passed = false; detail = `流动比率=${currentRatio.toFixed(2)}(一般1.0-1.5)`; }
    else if (currentRatio >= 0.5) { score = 1; passed = false; detail = `流动比率=${currentRatio.toFixed(2)}(偏低0.5-1.0)`; }
    else { score = 0; passed = false; detail = `流动比率=${currentRatio.toFixed(2)}(过低<0.5)`; }

    return { name: "流动性安全边际", score, maxScore: 10, passed, detail };
  } catch (e) {
    return { name: "流动性安全边际", score: 0, maxScore: 10, passed: false, detail: "数据缺失" };
  }
}

// 4. 现金安全边际得分（10分）
export function calculateCashSafety(stock: StockData): ScoreDetail {
  try {
    const cash = safeNumber(stock.cash_equivalents);
    const debt = safeNumber(stock.total_debt) || 0;
    const marketCap = safeNumber(stock.market_cap);

    if (!cash || !marketCap) {
      return { name: "现金安全边际(净现金/市值)", score: 0, maxScore: 10, passed: false, detail: "数据缺失" };
    }

    if (marketCap <= 0) {
      return { name: "现金安全边际(净现金/市值)", score: 0, maxScore: 10, passed: false, detail: "市值为0或负数" };
    }

    const netCashRatio = ((cash - debt) / marketCap) * 100;
    let score = 0;
    let passed = false;
    let detail = "";

    if (netCashRatio >= 30) { score = 10; passed = true; detail = `净现金/市值=${netCashRatio.toFixed(1)}%(极佳≥30%)`; }
    else if (netCashRatio >= 10) { score = 8; passed = true; detail = `净现金/市值=${netCashRatio.toFixed(1)}%(优秀10-30%)`; }
    else if (netCashRatio >= 0) { score = 6; passed = true; detail = `净现金/市值=${netCashRatio.toFixed(1)}%(良好0-10%)`; }
    else if (netCashRatio >= -10) { score = 3; passed = false; detail = `净现金/市值=${netCashRatio.toFixed(1)}%(一般-10-0%)`; }
    else if (netCashRatio >= -30) { score = 1; passed = false; detail = `净现金/市值=${netCashRatio.toFixed(1)}%(偏低-30~-10%)`; }
    else { score = 0; passed = false; detail = `净现金/市值=${netCashRatio.toFixed(1)}%(过低<-30%)`; }

    return { name: "现金安全边际(净现金/市值)", score, maxScore: 10, passed, detail };
  } catch (e) {
    return { name: "现金安全边际(净现金/市值)", score: 0, maxScore: 10, passed: false, detail: "数据缺失" };
  }
}

// 5. 资产安全性得分（10分）
export function calculateAssetSafety(stock: StockData): ScoreDetail {
  try {
    const stockPrice = safeNumber(stock.stock_price);
    const currentAssets = safeNumber(stock.current_assets);
    const totalLiabilities = safeNumber(stock.total_liabilities);
    const totalShares = safeNumber(stock.total_shares);

    if (!stockPrice || !currentAssets || !totalLiabilities || !totalShares) {
      return { name: "资产安全性(NCAV)", score: 0, maxScore: 10, passed: false, detail: "数据缺失" };
    }

    if (totalShares <= 0) {
      return { name: "资产安全性(NCAV)", score: 0, maxScore: 10, passed: false, detail: "总股本为0或负数" };
    }

    const ncavPerShare = (currentAssets - totalLiabilities) / totalShares;
    if (ncavPerShare <= 0) {
      return { name: "资产安全性(NCAV)", score: 0, maxScore: 10, passed: false, detail: "NCAV为负或0" };
    }

    const ncavRatio = stockPrice / ncavPerShare;
    let score = 0;
    let passed = false;
    let detail = "";

    if (ncavRatio <= 0.67) { score = 10; passed = true; detail = `股价/NCAV=${ncavRatio.toFixed(2)}(完美≤0.67)`; }
    else if (ncavRatio <= 1.0) { score = 8; passed = true; detail = `股价/NCAV=${ncavRatio.toFixed(2)}(优秀0.67-1.0)`; }
    else if (ncavRatio <= 1.5) { score = 5; passed = false; detail = `股价/NCAV=${ncavRatio.toFixed(2)}(一般1.0-1.5)`; }
    else if (ncavRatio <= 2.0) { score = 2; passed = false; detail = `股价/NCAV=${ncavRatio.toFixed(2)}(偏高1.5-2.0)`; }
    else { score = 0; passed = false; detail = `股价/NCAV=${ncavRatio.toFixed(2)}(过高>2.0)`; }

    return { name: "资产安全性(NCAV)", score, maxScore: 10, passed, detail };
  } catch (e) {
    return { name: "资产安全性(NCAV)", score: 0, maxScore: 10, passed: false, detail: "数据缺失" };
  }
}

// 6. 盈利质量得分（15分）
export function calculateProfitQuality(stock: StockData): ScoreDetail {
  try {
    const operatingCashFlow = safeNumber(stock.operating_cash_flow);
    const netIncome = safeNumber(stock.net_income);
    const adjustedNetIncome = safeNumber(stock.adjusted_net_income);

    if (!operatingCashFlow || !netIncome) {
      return { name: "盈利质量(现金比率+核心占比)", score: 0, maxScore: 15, passed: false, detail: "数据缺失" };
    }

    // 净利润现金比率打分（0-8分）
    let crScore = 0;
    let crDesc = "";
    if (netIncome > 0) {
      const cashRatio = operatingCashFlow / netIncome;
      if (cashRatio >= 1.2) { crScore = 8; crDesc = `现金比率=${cashRatio.toFixed(2)}(优秀≥1.2)`; }
      else if (cashRatio >= 1.0) { crScore = 7; crDesc = `现金比率=${cashRatio.toFixed(2)}(良好1.0-1.2)`; }
      else if (cashRatio >= 0.8) { crScore = 5; crDesc = `现金比率=${cashRatio.toFixed(2)}(一般0.8-1.0)`; }
      else if (cashRatio >= 0.5) { crScore = 2; crDesc = `现金比率=${cashRatio.toFixed(2)}(偏低0.5-0.8)`; }
      else { crScore = 0; crDesc = `现金比率=${cashRatio.toFixed(2)}(较差<0.5)`; }
    } else {
      crDesc = `净利润为负(${netIncome.toFixed(0)})`;
    }

    // 核心业务利润占比打分（0-7分）
    let coreScore = 0;
    let coreDesc = "";
    if (adjustedNetIncome && netIncome > 0) {
      const coreRatio = adjustedNetIncome / netIncome;
      if (coreRatio >= 0.95) { coreScore = 7; coreDesc = `核心占比=${coreRatio.toFixed(2)}(优秀≥95%)`; }
      else if (coreRatio >= 0.85) { coreScore = 5; coreDesc = `核心占比=${coreRatio.toFixed(2)}(良好85-95%)`; }
      else if (coreRatio >= 0.70) { coreScore = 3; coreDesc = `核心占比=${coreRatio.toFixed(2)}(一般70-85%)`; }
      else if (coreRatio >= 0.50) { coreScore = 1; coreDesc = `核心占比=${coreRatio.toFixed(2)}(偏低50-70%)`; }
      else { coreScore = 0; coreDesc = `核心占比=${coreRatio.toFixed(2)}(较差<50%)`; }
    } else if (netIncome > 0) {
      coreDesc = "数据缺失";
    } else {
      coreDesc = "净利润为负";
    }

    const totalScore = crScore + coreScore;
    return {
      name: "盈利质量(现金比率+核心占比)",
      score: totalScore,
      maxScore: 15,
      passed: totalScore >= 10,
      detail: `${crDesc}, ${coreDesc}, 总分:${totalScore.toFixed(1)}`
    };
  } catch (e) {
    return { name: "盈利质量(现金比率+核心占比)", score: 0, maxScore: 15, passed: false, detail: "数据缺失" };
  }
}

// 7. ROIC得分（12分）
export function calculateROICQuality(stock: StockData): ScoreDetail {
  try {
    const ebit = safeNumber(stock.ebit);
    const investedCapital = safeNumber(stock.invested_capital);
    const taxRate = safeNumber(stock.tax_rate) || 0.25;

    if (!ebit || !investedCapital) {
      return { name: "资本回报率(ROIC)", score: 0, maxScore: 12, passed: false, detail: "数据缺失" };
    }

    if (investedCapital <= 0) {
      return { name: "资本回报率(ROIC)", score: 0, maxScore: 12, passed: false, detail: "投入资本为0或负数" };
    }

    const nopat = ebit * (1 - taxRate);
    const roic = (nopat / investedCapital) * 100;

    let score = 0;
    let passed = false;
    let detail = "";

    if (roic >= 20) { score = 12; passed = true; detail = `ROIC=${roic.toFixed(2)}%(优秀≥20%)`; }
    else if (roic >= 15) { score = 10; passed = true; detail = `ROIC=${roic.toFixed(2)}%(良好15-20%)`; }
    else if (roic >= 10) { score = 8; passed = true; detail = `ROIC=${roic.toFixed(2)}%(达标10-15%)`; }
    else if (roic >= 5) { score = 4; passed = false; detail = `ROIC=${roic.toFixed(2)}%(偏低5-10%)`; }
    else { score = 0; passed = false; detail = `ROIC=${roic.toFixed(2)}%(较差<5%)`; }

    return { name: "资本回报率(ROIC)", score, maxScore: 12, passed, detail };
  } catch (e) {
    return { name: "资本回报率(ROIC)", score: 0, maxScore: 12, passed: false, detail: "数据缺失" };
  }
}

// 8. 去杠杆后ROE得分（12分）
export function calculateLowLeverageROE(stock: StockData): ScoreDetail {
  try {
    const roe = safeNumber(stock.roe);
    const equityMultiplier = safeNumber(stock.equity_multiplier);

    if (!roe || !equityMultiplier) {
      return { name: "去杠杆后ROE", score: 0, maxScore: 12, passed: false, detail: "数据缺失" };
    }

    if (equityMultiplier <= 0) {
      return { name: "去杠杆后ROE", score: 0, maxScore: 12, passed: false, detail: "权益乘数为0或负数" };
    }

    const lowLeverageROE = roe / equityMultiplier;

    let score = 0;
    let passed = false;
    let detail = "";

    if (lowLeverageROE >= 15) { score = 12; passed = true; detail = `低杠杆ROE=${lowLeverageROE.toFixed(2)}%(≥15%, 去杠杆后仍优秀)`; }
    else if (lowLeverageROE >= 10) { score = 10; passed = true; detail = `低杠杆ROE=${lowLeverageROE.toFixed(2)}%(10~15%, 去杠杆后良好)`; }
    else if (lowLeverageROE >= 5) { score = 6; passed = false; detail = `低杠杆ROE=${lowLeverageROE.toFixed(2)}%(5~10%, 去杠杆后一般)`; }
    else { score = 0; passed = false; detail = `低杠杆ROE=${lowLeverageROE.toFixed(2)}%(<5%, 去杠杆后较差)`; }

    return { name: "去杠杆后ROE", score, maxScore: 12, passed, detail };
  } catch (e) {
    return { name: "去杠杆后ROE", score: 0, maxScore: 12, passed: false, detail: "数据缺失" };
  }
}

// 9. 市赚率PR得分（12分）
export function calculatePRRatio(stock: StockData): ScoreDetail {
  try {
    const peRatio = safeNumber(stock.pe_ratio);
    const roe = safeNumber(stock.roe);

    if (!peRatio || !roe) {
      return { name: "市赚率(PR)", score: 0, maxScore: 12, passed: false, detail: "数据缺失" };
    }

    if (roe <= 0) {
      return { name: "市赚率(PR)", score: 0, maxScore: 12, passed: false, detail: `ROE为负(${roe.toFixed(2)}%)` };
    }

    const prRatio = peRatio / (roe / 100);

    let score = 0;
    let passed = false;
    let detail = "";

    if (prRatio <= 0.8) { score = 12; passed = true; detail = `PR比率=${prRatio.toFixed(2)}(≤0.8, 估值性价比高)`; }
    else if (prRatio <= 1.2) { score = 10; passed = true; detail = `PR比率=${prRatio.toFixed(2)}(0.8~1.2, 估值合理)`; }
    else if (prRatio <= 2.0) { score = 5; passed = false; detail = `PR比率=${prRatio.toFixed(2)}(1.2~2.0, 估值偏高)`; }
    else { score = 0; passed = false; detail = `PR比率=${prRatio.toFixed(2)}(>2.0, 估值过高)`; }

    return { name: "市赚率(PR)", score, maxScore: 12, passed, detail };
  } catch (e) {
    return { name: "市赚率(PR)", score: 0, maxScore: 12, passed: false, detail: "数据缺失" };
  }
}

// 10. 有形市净率得分（10分）
export function calculateTangiblePB(stock: StockData): ScoreDetail {
  try {
    const stockPrice = safeNumber(stock.stock_price);
    const totalAssets = safeNumber(stock.total_assets);
    const totalLiabilities = safeNumber(stock.total_liabilities);
    const goodwill = safeNumber(stock.goodwill) || 0;
    const intangibleAssets = safeNumber(stock.intangible_assets) || 0;
    const totalShares = safeNumber(stock.total_shares);

    if (!stockPrice || !totalAssets || !totalLiabilities || !totalShares) {
      return { name: "有形市净率", score: 0, maxScore: 10, passed: false, detail: "数据缺失" };
    }

    if (totalShares <= 0) {
      return { name: "有形市净率", score: 0, maxScore: 10, passed: false, detail: "总股本为0或负数" };
    }

    const tangibleEquity = totalAssets - totalLiabilities - goodwill - intangibleAssets;
    if (tangibleEquity <= 0) {
      return { name: "有形市净率", score: 0, maxScore: 10, passed: false, detail: "有形净资产为负或0" };
    }

    const tangibleBookValuePerShare = tangibleEquity / totalShares;
    const tangiblePB = stockPrice / tangibleBookValuePerShare;

    let score = 0;
    let passed = false;
    let detail = "";

    if (tangiblePB <= 0.8) { score = 10; passed = true; detail = `有形PB=${tangiblePB.toFixed(2)}(深度价值≤0.8)`; }
    else if (tangiblePB <= 1.0) { score = 8; passed = true; detail = `有形PB=${tangiblePB.toFixed(2)}(优秀0.8-1.0)`; }
    else if (tangiblePB <= 1.5) { score = 5; passed = true; detail = `有形PB=${tangiblePB.toFixed(2)}(合理1.0-1.5)`; }
    else if (tangiblePB <= 2.0) { score = 2; passed = false; detail = `有形PB=${tangiblePB.toFixed(2)}(偏高1.5-2.0)`; }
    else if (tangiblePB <= 3.0) { score = 1; passed = false; detail = `有形PB=${tangiblePB.toFixed(2)}(较高2.0-3.0)`; }
    else { score = 0; passed = false; detail = `有形PB=${tangiblePB.toFixed(2)}(过高>3.0)`; }

    return { name: "有形市净率", score, maxScore: 10, passed, detail };
  } catch (e) {
    return { name: "有形市净率", score: 0, maxScore: 10, passed: false, detail: "数据缺失" };
  }
}

// 11. 资本配置纪律得分（7分）
export function calculateCapitalDiscipline(stock: StockData): ScoreDetail {
  try {
    const operatingCashFlow = safeNumber(stock.operating_cash_flow);
    const netIncome = safeNumber(stock.net_income);

    if (!operatingCashFlow || !netIncome) {
      return { name: "资本配置纪律", score: 0, maxScore: 7, passed: false, detail: "数据缺失" };
    }

    const fcfPositive = operatingCashFlow > 0 && netIncome > 0;

    if (fcfPositive) {
      return {
        name: "资本配置纪律",
        score: 7,
        maxScore: 7,
        passed: true,
        detail: `自由现金流为正(OCF=${operatingCashFlow.toFixed(0)}M), 资本配置理性`
      };
    } else {
      let detail = "";
      if (operatingCashFlow <= 0) {
        detail = `自由现金流为负(OCF=${operatingCashFlow.toFixed(0)}M), 资本配置存疑`;
      } else {
        detail = `净利润为负(${netIncome.toFixed(0)}M), 资本配置存疑`;
      }
      return { name: "资本配置纪律", score: 0, maxScore: 7, passed: false, detail };
    }
  } catch (e) {
    return { name: "资本配置纪律", score: 0, maxScore: 7, passed: false, detail: "数据缺失" };
  }
}

// 12. 现金流稳定性得分（12分）
export function calculateCashFlowStability(stock: StockData): ScoreDetail {
  try {
    const operatingCashFlow = safeNumber(stock.operating_cash_flow);
    const netIncome = safeNumber(stock.net_income);
    const accountsReceivable = safeNumber(stock.accounts_receivable);

    if (!operatingCashFlow || !netIncome) {
      return { name: "现金流稳定性(财报操纵检测)", score: 0, maxScore: 12, passed: false, detail: "数据缺失" };
    }

    let score = 0;
    const details: string[] = [];

    // 净利润现金比率（0-6分）
    if (netIncome > 0) {
      const cashRatio = operatingCashFlow / netIncome;
      if (cashRatio >= 1.0) { score += 6; details.push(`现金比率=${cashRatio.toFixed(2)}(优秀)`); }
      else if (cashRatio >= 0.8) { score += 4.5; details.push(`现金比率=${cashRatio.toFixed(2)}(良好)`); }
      else if (cashRatio >= 0.5) { score += 3; details.push(`现金比率=${cashRatio.toFixed(2)}(一般)`); }
      else { score += 0; details.push(`现金比率=${cashRatio.toFixed(2)}(较差，潜在风险)`); }
    } else {
      details.push(`净利润为负(${netIncome.toFixed(0)})`);
    }

    // 应收账款检查（0-6分）
    if (accountsReceivable && netIncome > 0) {
      const arRatio = accountsReceivable / Math.abs(netIncome);
      if (arRatio <= 0.2) { score += 6; details.push(`应收账款/利润=${arRatio.toFixed(2)}(健康)`); }
      else if (arRatio <= 0.5) { score += 4; details.push(`应收账款/利润=${arRatio.toFixed(2)}(一般)`); }
      else if (arRatio <= 1.0) { score += 2; details.push(`应收账款/利润=${arRatio.toFixed(2)}(偏高)`); }
      else { score += 0; details.push(`应收账款/利润=${arRatio.toFixed(2)}(过高，风险)`); }
    } else {
      details.push("应收账款检查：数据缺失或净利润为负");
    }

    return {
      name: "现金流稳定性(财报操纵检测)",
      score,
      maxScore: 12,
      passed: score >= 6,
      detail: details.join(", ")
    };
  } catch (e) {
    return { name: "现金流稳定性(财报操纵检测)", score: 0, maxScore: 12, passed: false, detail: "数据缺失" };
  }
}

// 13. 股息收益率得分（8分）
export function calculateDividendYield(stock: StockData): ScoreDetail {
  try {
    const dividends = safeNumber(stock.dividends_paid) || 0;
    const marketCap = safeNumber(stock.market_cap);

    if (!marketCap || marketCap <= 0) {
      return { name: "股息收益率", score: 0, maxScore: 8, passed: false, detail: "市值数据缺失" };
    }

    const dividendYield = (dividends / marketCap) * 100;

    let score = 0;
    let passed = false;
    let detail = "";

    if (dividendYield >= 5.0) { score = 8; passed = true; detail = `股息率=${dividendYield.toFixed(2)}%(优秀≥5%)`; }
    else if (dividendYield >= 3.0) { score = 6; passed = true; detail = `股息率=${dividendYield.toFixed(2)}%(良好3-5%)`; }
    else if (dividendYield >= 1.5) { score = 4; passed = false; detail = `股息率=${dividendYield.toFixed(2)}%(一般1.5-3%)`; }
    else if (dividendYield >= 0.5) { score = 2; passed = false; detail = `股息率=${dividendYield.toFixed(2)}%(较低0.5-1.5%)`; }
    else { score = 0; passed = false; detail = `股息率=${dividendYield.toFixed(2)}%(过低<0.5%)`; }

    return { name: "股息收益率", score, maxScore: 8, passed, detail };
  } catch (e) {
    return { name: "股息收益率", score: 0, maxScore: 8, passed: false, detail: "数据缺失" };
  }
}

// 14. 总股东回报率得分（8分）
export function calculateTotalPayoutYield(stock: StockData): ScoreDetail {
  try {
    const dividends = safeNumber(stock.dividends_paid) || 0;
    const repurchases = safeNumber(stock.share_repurchases) || 0;
    const marketCap = safeNumber(stock.market_cap);

    if (!marketCap || marketCap <= 0) {
      return { name: "总股东回报率(分红+回购)", score: 0, maxScore: 8, passed: false, detail: "市值数据缺失" };
    }

    const totalPayoutYield = ((dividends + repurchases) / marketCap) * 100;

    let score = 0;
    let passed = false;
    let detail = "";

    if (totalPayoutYield >= 6.0) { score = 8; passed = true; detail = `总回报率=${totalPayoutYield.toFixed(2)}%(优秀≥6%)`; }
    else if (totalPayoutYield >= 4.0) { score = 6; passed = true; detail = `总回报率=${totalPayoutYield.toFixed(2)}%(良好4-6%)`; }
    else if (totalPayoutYield >= 2.0) { score = 4; passed = true; detail = `总回报率=${totalPayoutYield.toFixed(2)}%(达标2-4%)`; }
    else if (totalPayoutYield >= 1.0) { score = 2; passed = false; detail = `总回报率=${totalPayoutYield.toFixed(2)}%(一般1-2%)`; }
    else { score = 0; passed = false; detail = `总回报率=${totalPayoutYield.toFixed(2)}%(偏低<1%)`; }

    return { name: "总股东回报率(分红+回购)", score, maxScore: 8, passed, detail };
  } catch (e) {
    return { name: "总股东回报率(分红+回购)", score: 0, maxScore: 8, passed: false, detail: "数据缺失" };
  }
}

// 15. 可持续增长率得分（9分）
export function calculateSustainableGrowth(stock: StockData): ScoreDetail {
  try {
    const roe = safeNumber(stock.roe);
    const dividends = safeNumber(stock.dividends_paid) || 0;
    const netIncome = safeNumber(stock.net_income);

    if (!roe || !netIncome) {
      return { name: "可持续增长率", score: 0, maxScore: 9, passed: false, detail: "数据缺失" };
    }

    if (netIncome <= 0) {
      return { name: "可持续增长率", score: 0, maxScore: 9, passed: false, detail: `净利润为负(${netIncome.toFixed(0)})` };
    }

    const retentionRatio = 1 - (dividends / netIncome);
    const sustainableGrowth = roe * retentionRatio;

    let score = 0;
    let passed = false;
    let detail = "";

    if (sustainableGrowth >= 15) { score = 9; passed = true; detail = `可持续增长率=${sustainableGrowth.toFixed(2)}%(优秀≥15%)`; }
    else if (sustainableGrowth >= 10) { score = 7; passed = true; detail = `可持续增长率=${sustainableGrowth.toFixed(2)}%(良好10-15%)`; }
    else if (sustainableGrowth >= 5) { score = 5; passed = false; detail = `可持续增长率=${sustainableGrowth.toFixed(2)}%(一般5-10%)`; }
    else if (sustainableGrowth >= 0) { score = 2; passed = false; detail = `可持续增长率=${sustainableGrowth.toFixed(2)}%(偏低0-5%)`; }
    else { score = 0; passed = false; detail = `可持续增长率=${sustainableGrowth.toFixed(2)}%(负增长<0%)`; }

    return { name: "可持续增长率", score, maxScore: 9, passed, detail };
  } catch (e) {
    return { name: "可持续增长率", score: 0, maxScore: 9, passed: false, detail: "数据缺失" };
  }
}

// 16. 财务风险调整（扣分项）
export function calculateFinancialRisk(stock: StockData): ScoreDetail {
  try {
    const totalLiabilities = safeNumber(stock.total_liabilities);
    const totalAssets = safeNumber(stock.total_assets);
    const netIncome = safeNumber(stock.net_income);
    const operatingCashFlow = safeNumber(stock.operating_cash_flow);
    const goodwill = safeNumber(stock.goodwill);
    const accountsReceivable = safeNumber(stock.accounts_receivable);

    let riskScore = 0;
    const riskDetails: string[] = [];

    // 检查1: 资不抵债
    if (totalLiabilities && totalAssets && totalLiabilities > totalAssets) {
      riskScore -= 10;
      riskDetails.push("资不抵债(-10分)");
    }

    // 检查2: 净资产为负
    if (totalLiabilities && totalAssets) {
      const netAssets = totalAssets - totalLiabilities;
      if (netAssets < 0) {
        riskScore -= 5;
        riskDetails.push("净资产为负(-5分)");
      }
    }

    // 检查3 & 4: 商誉过高
    if (goodwill && totalLiabilities && totalAssets) {
      const netAssets = totalAssets - totalLiabilities;
      if (netAssets > 0) {
        const goodwillRatio = goodwill / netAssets;
        if (goodwillRatio > 0.5) {
          riskScore -= 10;
          riskDetails.push(`商誉极高(${(goodwillRatio * 100).toFixed(0)}%>50%, -10分)`);
        } else if (goodwillRatio > 0.3) {
          riskScore -= 5;
          riskDetails.push(`商誉偏高(${(goodwillRatio * 100).toFixed(0)}%>30%, -5分)`);
        }
      }
    }

    // 检查5: 净利润与现金流双亏
    if (netIncome && operatingCashFlow && netIncome < 0 && operatingCashFlow < 0) {
      riskScore -= 5;
      riskDetails.push("净利润与现金流双亏(-5分)");
    }

    // 检查6: 应收账款异常高
    if (accountsReceivable && netIncome && netIncome > 0) {
      const arRatio = accountsReceivable / netIncome;
      if (arRatio > 1.0) {
        riskScore -= 3;
        riskDetails.push(`应收账款过高(${(arRatio * 100).toFixed(0)}%>100%, -3分)`);
      }
    }

    // 检查7: 资产负债率过高
    if (totalLiabilities && totalAssets && totalAssets > 0) {
      const debtRatio = totalLiabilities / totalAssets;
      if (debtRatio > 0.8) {
        riskScore -= 3;
        riskDetails.push(`资产负债率极高(${(debtRatio * 100).toFixed(0)}%>80%, -3分)`);
      }
    }

    // 检查8: 净利润为负
    if (netIncome && netIncome < 0) {
      riskScore -= 2;
      riskDetails.push(`净利润为负(${netIncome.toFixed(0)}, -2分)`);
    }

    const detail = riskDetails.length > 0 ? riskDetails.join(", ") : "无明显财务风险";

    return {
      name: "财务风险调整(商誉/应收账款/资不抵债)",
      score: riskScore,
      maxScore: 0,
      passed: riskScore === 0,
      detail
    };
  } catch (e) {
    return { name: "财务风险调整(商誉/应收账款/资不抵债)", score: 0, maxScore: 0, passed: false, detail: "数据缺失" };
  }
}
