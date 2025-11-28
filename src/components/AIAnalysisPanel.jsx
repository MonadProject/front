import { useState } from "react";
import { Lock, Unlock, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { useX402API } from "../hooks/useX402API";
import { X402_CONFIG } from "../config/x402";

export default function AIAnalysisPanel({ auction }) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { callX402API, isLoading, data: analysis } = useX402API();
  const hasPaid = !!analysis;

  const handleGetAnalysis = async () => {
    await callX402API(`/api/auction/${auction.id}/analysis`);
    setShowAnalysis(true);
  };

  return (
    <div className="space-y-4">
      <div
        className="p-4 rounded-xl"
        style={{
          background: hasPaid
            ? "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)"
            : "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)",
          border: hasPaid
            ? "1px solid #10B981"
            : "1px solid rgba(139, 92, 246, 0.3)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: hasPaid
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(139, 92, 246, 0.2)",
              }}
            >
              {hasPaid ? (
                <Unlock className="size-5" style={{ color: "#10B981" }} />
              ) : (
                <Lock className="size-5" style={{ color: "#8B5CF6" }} />
              )}
            </div>
            <div>
              <div
                className="font-bold"
                style={{ color: hasPaid ? "#10B981" : "#E2E8F0" }}
              >
                {hasPaid ? "✅ AI分析已解锁" : "🤖 AI智能分析"}
              </div>
              <div className="text-xs" style={{ color: "#6B7280" }}>
                {hasPaid
                  ? "由 Monad Auction Analytics 提供"
                  : `使用x402协议 · ${X402_CONFIG.PRICES.AI_ANALYSIS} MON/次`}
              </div>
            </div>
          </div>
          <div>
            {!hasPaid && (
              <button
                onClick={handleGetAnalysis}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                  color: "white",
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                {isLoading
                  ? "处理中..."
                  : `支付 ${X402_CONFIG.PRICES.AI_ANALYSIS} MON`}
              </button>
            )}
            {hasPaid && (
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  color: "white",
                }}
              >
                <Sparkles className="size-4" />
                {showAnalysis ? "隐藏分析" : "查看分析"}
              </button>
            )}
          </div>
        </div>
      </div>

      {hasPaid && showAnalysis && (
        <div
          className="p-4 rounded-xl space-y-3"
          style={{
            background:
              "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
          }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-5" style={{ color: "#8B5CF6" }} />
            <span className="font-bold" style={{ color: "#E2E8F0" }}>
              AI分析报告
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <TrendingUp
                className="size-4 mt-0.5"
                style={{ color: "#10B981" }}
              />
              <div className="flex-1">
                <div style={{ color: "#10B981" }} className="font-medium">
                  {analysis.trend === "increasing"
                    ? "📈 上涨趋势"
                    : "📊 平稳趋势"}
                </div>
                <div style={{ color: "#93C5FD" }} className="text-sm">
                  建议出价：{Number(analysis.suggestedBid).toFixed(2)} MON
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div style={{ color: "#93C5FD" }} className="text-xs">
                  当前价格
                </div>
                <div style={{ color: "#E2E8F0" }} className="text-lg">
                  {Number(analysis.currentPrice).toFixed(2)} MON
                </div>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div style={{ color: "#93C5FD" }} className="text-xs">
                  预测价格
                </div>
                <div style={{ color: "#E2E8F0" }} className="text-lg">
                  {Number(analysis.predictedPrice).toFixed(2)} MON
                </div>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div style={{ color: "#93C5FD" }} className="text-xs">
                  置信度
                </div>
                <div style={{ color: "#E2E8F0" }} className="text-lg">
                  {Math.round(Number(analysis.confidence) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
