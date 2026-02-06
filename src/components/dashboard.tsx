"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, History, BarChart3, Download, Search, Sparkles } from "lucide-react";
import { scorer } from "@/lib/scoring";
import CsvUploader from "./csv-uploader";
import ScoringResults from "./scoring-results";
import ScoringHistory from "./scoring-history";
import StockSearch from "./stock-search";
import StockDiscovery from "./stock-discovery";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("discover");
  const [scoringResults, setScoringResults] = useState<any>(null);
  const [stockList, setStockList] = useState<any[]>([]);
  const [useMlWeights, setUseMlWeights] = useState(true);

  const handleScoringComplete = (results: any) => {
    setScoringResults(results);
    setActiveTab("results");
  };

  const handleStocksAdd = async (stocks: any[]) => {
    // 添加到股票列表
    setStockList((prev) => [...prev, ...stocks]);

    // 自动评分
    const results = scorer.calculateAllStocks(stocks, useMlWeights);

    // 如果已经有评分结果，合并结果
    if (scoringResults) {
      const mergedResults = {
        ...scoringResults,
        results: [...scoringResults.results, ...results].sort(
          (a, b) => b.displayScore - a.displayScore
        ),
        count: (scoringResults.count || 0) + results.length,
      };
      setScoringResults(mergedResults);
    } else {
      setScoringResults({
        count: results.length,
        results: results.sort((a, b) => b.displayScore - a.displayScore),
      });
    }

    // 提示用户切换到结果页面
    setTimeout(() => {
      setActiveTab("results");
    }, 500);
  };

  const exportToCSV = () => {
    if (!scoringResults?.results) return;

    const headers = [
      "排名",
      "股票代码",
      "股票名称",
      "评分",
      "满分",
      "得分率",
      "投资建议",
      "理想情况",
    ];

    const rows = scoringResults.results.map((r: any, i: number) => [
      i + 1,
      r.stockCode,
      r.stockName,
      r.displayScore.toFixed(2),
      r.displayMax,
      ((r.displayScore / r.displayMax) * 100).toFixed(2) + "%",
      r.investmentAdvice,
      r.isIdeal ? "是" : "否",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any[]) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `评分结果_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">价值投资选股评分系统</h1>
                <p className="text-sm text-muted-foreground">基于格雷厄姆安全边际理论</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useMlWeights}
                  onChange={(e) => setUseMlWeights(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>ML加权</span>
              </label>
              {scoringResults && (
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  导出结果
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="discover" className="gap-2">
              <Sparkles className="h-4 w-4" />
              发现股票
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Search className="h-4 w-4" />
              搜索股票
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              上传CSV
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2" disabled={!scoringResults}>
              <BarChart3 className="h-4 w-4" />
              评分结果
              {scoringResults && (
                <Badge variant="secondary">{scoringResults.count}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              历史记录
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <Card>
              <CardHeader>
                <CardTitle>发现优质股票</CardTitle>
                <CardDescription>
                  浏览热门股票、行业龙头，一键添加并评分
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StockDiscovery onStocksAdd={handleStocksAdd} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>搜索并添加股票</CardTitle>
                <CardDescription>
                  搜索股票名称或代码，自动获取实时财务数据并进行评分
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StockSearch onStocksAdd={handleStocksAdd} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>上传CSV文件进行评分</CardTitle>
                <CardDescription>
                  支持包含股票财务数据的CSV文件，系统将自动计算价值投资评分
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CsvUploader onComplete={handleScoringComplete} useMlWeights={useMlWeights} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            {scoringResults ? (
              <Card>
                <CardHeader>
                  <CardTitle>评分结果</CardTitle>
                  <CardDescription>
                    共评分 {scoringResults.count} 只股票，按得分从高到低排序
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScoringResults results={scoringResults.results} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">暂无评分结果，请先上传CSV或搜索股票</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>评分历史</CardTitle>
                <CardDescription>
                  查看您的历史评分记录
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScoringHistory />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
