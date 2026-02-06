import { StockData, ScoringResult, ScoreDetail } from './types';
import { ML_WEIGHTS, SCORE_RULES } from './constants';
import * as calculations from './calculations';

export class ValueInvestmentScorer {
  /**
   * 计算单只股票的总分和各项得分
   */
  calculateScore(stock: StockData): Omit<ScoringResult, 'useMlWeights' | 'weightedTotal' | 'displayScore' | 'displayScoreType' | 'displayMax' | 'investmentAdvice'> {
    const scores: Record<string, ScoreDetail> = {};

    // 安全边际指标（60分）
    scores.valuation_safety = calculations.calculateValuationSafety(stock);
    scores.debt_safety = calculations.calculateDebtSafety(stock);
    scores.liquidity_safety = calculations.calculateLiquiditySafety(stock);
    scores.cash_safety = calculations.calculateCashSafety(stock);
    scores.asset_safety = calculations.calculateAssetSafety(stock);

    // 公司质量指标（92分）
    scores.profit_quality = calculations.calculateProfitQuality(stock);
    scores.roic_quality = calculations.calculateROICQuality(stock);
    scores.low_leverage_roe = calculations.calculateLowLeverageROE(stock);
    scores.pr_ratio = calculations.calculatePRRatio(stock);
    scores.tangible_pb = calculations.calculateTangiblePB(stock);
    scores.capital_discipline = calculations.calculateCapitalDiscipline(stock);
    scores.cash_flow_stability = calculations.calculateCashFlowStability(stock);

    // 股东回报指标（25分）
    scores.dividend_yield = calculations.calculateDividendYield(stock);
    scores.total_payout_yield = calculations.calculateTotalPayoutYield(stock);
    scores.sustainable_growth = calculations.calculateSustainableGrowth(stock);

    // 计算原始总分
    let totalScore = 0;
    for (const score of Object.values(scores)) {
      totalScore += score.score;
    }

    // 计算财务风险调整（扣分项）
    const financialRisk = calculations.calculateFinancialRisk(stock);
    scores.financial_risk = financialRisk;
    const riskAdjustment = financialRisk.score;
    totalScore += riskAdjustment;

    // 判断是否满足"理想情况"
    const isIdeal = scores.cash_safety.score >= 8;

    return {
      stockCode: stock.stock_code || 'N/A',
      stockName: stock.company_name || stock.stock_name || 'N/A',
      scores,
      totalScore,
      maxScore: 165,
      riskAdjustment,
      isIdeal,
    };
  }

  /**
   * 计算加权得分（使用ML权重）
   */
  calculateWeightedScore(stock: StockData, useMlWeights = true): ScoringResult {
    const baseResult = this.calculateScore(stock);
    const { totalScore: originalTotal, scores, riskAdjustment } = baseResult;

    if (!useMlWeights) {
      return {
        ...baseResult,
        useMlWeights: false,
        weightedTotal: undefined,
        displayScore: originalTotal,
        displayScoreType: '原始总分',
        displayMax: 165,
        investmentAdvice: this.getInvestmentAdvice(originalTotal, 165),
      };
    }

    // 计算加权总分
    let weightedTotal = 0;

    for (const [key, scoreInfo] of Object.entries(scores)) {
      if (key === 'financial_risk') continue;

      const scoreRatio = scoreInfo.score / scoreInfo.maxScore;
      const mlWeight = ML_WEIGHTS[key] || 0;
      weightedTotal += scoreRatio * mlWeight;
    }

    // 转换为100分制
    const weightedTotalScaled = weightedTotal * 100;

    // 加上财务风险调整（按比例调整到100分制）
    const riskAdjustmentScaled = riskAdjustment / 165 * 100;
    const finalWeightedScore = weightedTotalScaled + riskAdjustmentScaled;

    return {
      ...baseResult,
      useMlWeights: true,
      weightedTotal: finalWeightedScore,
      displayScore: finalWeightedScore,
      displayScoreType: '加权总分',
      displayMax: 100,
      investmentAdvice: this.getInvestmentAdvice(finalWeightedScore, 100),
    };
  }

  /**
   * 计算多只股票的得分
   */
  calculateAllStocks(stocks: StockData[], useMlWeights = true): ScoringResult[] {
    return stocks.map(stock => this.calculateWeightedScore(stock, useMlWeights));
  }

  /**
   * 根据总分给出投资建议
   */
  getInvestmentAdvice(totalScore: number, maxScore = 100): string {
    const scoreRatio = totalScore / maxScore;

    if (scoreRatio >= 0.77) {
      return "强烈建议关注（优质价值股，深度安全边际）";
    } else if (scoreRatio >= 0.62) {
      return "具备安全边际，值得深入研究";
    } else if (scoreRatio >= 0.44) {
      return "符合价值投资标准，可关注";
    } else if (scoreRatio >= 0.26) {
      return "部分达标，需谨慎评估";
    } else {
      return "不符合价值投资标准，不建议投资";
    }
  }
}

// 默认实例
export const scorer = new ValueInvestmentScorer();
