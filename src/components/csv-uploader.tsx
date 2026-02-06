"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface CsvUploaderProps {
  onComplete: (results: any) => void;
  useMlWeights?: boolean;
}

export default function CsvUploader({ onComplete, useMlWeights: externalUseMlWeights = true }: CsvUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const useMlWeights = externalUseMlWeights;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("请选择有效的CSV文件");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("useMlWeights", useMlWeights.toString());

      const response = await fetch("/api/scoring", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "评分失败");
      }

      onComplete(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "评分失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("请选择有效的CSV文件");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center transition-colors hover:border-primary/50"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          {!file ? (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  拖拽CSV文件到这里，或点击下方按钮选择文件
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  选择文件
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <FileText className="h-12 w-12 mx-auto text-green-600" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                重新选择
              </Button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            评分中...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            开始评分
          </>
        )}
      </Button>

      <div className="text-sm text-muted-foreground space-y-2">
        <p className="font-medium">CSV文件格式要求：</p>
        <ul className="list-disc list-inside space-y-1">
          <li>支持中英文列名</li>
          <li>必需字段：公司名称、当前股价、市值、市盈率(P/E)、市净率(P/B)</li>
          <li>其他字段：净利润、经营现金流、总资产、总负债等</li>
          <li>数值字段支持千分位逗号</li>
        </ul>
      </div>
    </div>
  );
}
