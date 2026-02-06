"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Loader2, Check } from "lucide-react";

interface SearchResult {
  code: string;
  name: string;
}

interface Stock {
  stock_code: string;
  company_name: string;
  [key: string]: any;
}

interface StockSearchProps {
  onStocksAdd: (stocks: Stock[]) => void;
}

export default function StockSearch({ onStocksAdd }: StockSearchProps) {
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [fetching, setFetching] = useState<Set<string>>(new Set());
  const [addedStocks, setAddedStocks] = useState<Set<string>>(new Set());

  // 搜索股票
  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(`/api/stock/yahoo-search?q=${encodeURIComponent(keyword)}`);
      const data = await response.json();

      if (data.results) {
        // 转换雅虎财经的代码格式为我们的格式
        // 600519.SS -> sh600519
        const convertedResults = data.results.map((r: any) => ({
          code: r.code.replace('.SS', '').replace('.SZ', '').toLowerCase(),
          name: r.name,
        }));
        setSearchResults(convertedResults);
      }
    } catch (error) {
      console.error("搜索失败:", error);
    } finally {
      setSearching(false);
    }
  }, [keyword]);

  // 添加单只股票
  const handleAddStock = async (code: string, name: string) => {
    if (fetching.has(code) || addedStocks.has(code)) return;

    setFetching((prev) => new Set(prev).add(code));

    try {
      const response = await fetch(`/api/stock/yahoo?code=${code}`);
      const data = await response.json();

      if (!data.error) {
        onStocksAdd([data]);
        setAddedStocks((prev) => new Set(prev).add(code));
      } else {
        console.error("获取数据失败:", data.error);
      }
    } catch (error) {
      console.error("添加股票失败:", error);
    } finally {
      setFetching((prev) => {
        const newSet = new Set(prev);
        newSet.delete(code);
        return newSet;
      });
    }
  };

  // 批量添加搜索结果
  const handleAddAll = async () => {
    const notAdded = searchResults.filter(
      (r) => !fetching.has(r.code) && !addedStocks.has(r.code)
    );

    for (const result of notAdded) {
      await handleAddStock(result.code, result.name);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* 搜索框 */}
        <div className="flex gap-2">
          <Input
            placeholder="输入股票代码（如：600519）或英文名称（如：Moutai）"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={searching || !keyword.trim()}>
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            搜索
          </Button>
        </div>

        {/* 搜索结果 */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                找到 {searchResults.length} 只股票
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddAll}
                disabled={
                  searchResults.every((r) => addedStocks.has(r.code)) ||
                  fetching.size > 0
                }
              >
                全部添加
              </Button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {searchResults.map((result) => {
                const isFetching = fetching.has(result.code);
                const isAdded = addedStocks.has(result.code);

                return (
                  <div
                    key={result.code}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.name}</span>
                        <Badge variant="secondary">{result.code}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        点击右侧按钮获取财务数据并添加到评分列表
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleAddStock(result.code, result.name)}
                      disabled={isFetching || isAdded}
                    >
                      {isFetching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isAdded ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          已添加
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          添加
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 已添加提示 */}
        {addedStocks.size > 0 && (
          <div className="text-sm text-muted-foreground">
            已添加 {addedStocks.size} 只股票，请切换到「评分结果」标签查看
          </div>
        )}
      </CardContent>
    </Card>
  );
}
