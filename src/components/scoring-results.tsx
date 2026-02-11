"use client";

import { ScoringResult as ScoringResultType } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatPercentage } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface ScoringResultsProps {
  results: ScoringResultType[];
}

export default function ScoringResults({ results }: ScoringResultsProps) {
  // 添加调试日志
  console.log('🎯 ScoringResults 组件渲染，收到结果数量:', results?.length || 0);

  const getScoreColor = (scoreRatio: number) => {
    if (scoreRatio >= 0.77) return "text-green-600";
    if (scoreRatio >= 0.62) return "text-blue-600";
    if (scoreRatio >= 0.44) return "text-yellow-600";
    return "text-red-600";
  };

  const getAdviceIcon = (advice: string) => {
    if (advice.includes("强烈建议")) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (advice.includes("安全边际")) return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
    if (advice.includes("谨慎")) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-4">
      {results.map((result, index) => {
        const scoreRatio = result.displayScore / result.displayMax;

        return (
          <Card key={result.stockCode} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <CardTitle className="text-lg">{result.stockName}</CardTitle>
                    {result.isIdeal && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        理想
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{result.stockCode}</p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getScoreColor(scoreRatio)}`}>
                    {formatNumber(result.displayScore)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    / {result.displayMax} ({formatPercentage(scoreRatio * 100)})
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>总得分</span>
                  <span className="font-medium">{formatPercentage(scoreRatio * 100)}</span>
                </div>
                <Progress value={scoreRatio * 100} className="h-2" />
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                {getAdviceIcon(result.investmentAdvice)}
                <span className="text-sm font-medium">{result.investmentAdvice}</span>
              </div>

              {result.riskAdjustment < 0 && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>风险调整: {result.riskAdjustment.toFixed(1)} 分</span>
                </div>
              )}

              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-primary list-none flex items-center gap-2">
                  <span>查看详细评分</span>
                  <span className="transition-transform group-open:rotate-90">›</span>
                </summary>
                <div className="mt-3 space-y-2 pl-4 border-l-2 border-muted">
                  {Object.entries(result.scores).map(([key, scoreInfo]: [string, any]) => (
                    <div key={key} className="text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted-foreground">{scoreInfo.name}</span>
                        <span className="font-medium">
                          {scoreInfo.score.toFixed(1)} / {scoreInfo.maxScore}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            scoreInfo.passed ? "bg-green-500" : "bg-yellow-500"
                          }`}
                          style={{
                            width: `${(scoreInfo.score / scoreInfo.maxScore) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {scoreInfo.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
