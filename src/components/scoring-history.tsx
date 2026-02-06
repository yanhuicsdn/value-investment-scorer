"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface HistoryRecord {
  id: string;
  stockCode: string;
  stockName: string;
  totalScore: number;
  maxScore: number;
  scoreRatio: number;
  investmentAdvice: string;
  isIdeal: boolean;
  useMlWeights: boolean;
  createdAt: Date;
}

export default function ScoringHistory() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/scoring/history?offset=${page * limit}&limit=${limit}`);
      const data = await response.json();

      if (data.success) {
        setRecords(data.results);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("获取历史记录失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条记录吗？")) return;

    try {
      const response = await fetch(`/api/scoring/history?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchHistory();
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          暂无历史记录
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {records.map((record) => {
              const scoreRatio = record.scoreRatio;
              const getScoreColor = () => {
                if (scoreRatio >= 0.77) return "text-green-600 bg-green-50";
                if (scoreRatio >= 0.62) return "text-blue-600 bg-blue-50";
                if (scoreRatio >= 0.44) return "text-yellow-600 bg-yellow-50";
                return "text-red-600 bg-red-50";
              };

              return (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{record.stockName}</p>
                            <p className="text-sm text-muted-foreground">{record.stockCode}</p>
                          </div>
                          {record.isIdeal && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              理想
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`text-lg font-bold ${getScoreColor().split(" ")[0]}`}>
                            {(record.totalScore).toFixed(1)}
                          </span>
                          <span className="text-muted-foreground">
                            / {record.maxScore}
                          </span>
                          <span className="text-muted-foreground">
                            {formatDate(new Date(record.createdAt))}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {record.investmentAdvice}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {page + 1} / {totalPages} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
