import { X, TrendingUp, Sparkles } from "lucide-react";
import { createPortal } from "react-dom";
import { short } from "../utils";

export default function AnalysisModal({ visible, analysis, onClose }) {
  if (!visible || !analysis) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-xl max-w-xl w-full"
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}
        >
          <div className="flex items-center gap-2" style={{ color: "#E2E8F0" }}>
            <Sparkles className="size-5" style={{ color: "#8B5CF6" }} />
            <span className="font-bold">AI分析报告</span>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-white/10"
            onClick={onClose}
          >
            <X className="size-5" style={{ color: "rgba(255,255,255,0.7)" }} />
          </button>
        </div>
        <div className="p-4 space-y-3">
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
                建议出价：{Number(analysis.suggestedBid).toFixed(6)} MON
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
                {Number(analysis.currentPrice).toFixed(6)} MON
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
                {Number(analysis.predictedPrice).toFixed(6)} MON
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

          <div
            className="mt-3 p-3 rounded-lg"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div style={{ color: "#93C5FD" }} className="text-xs">
              分析理由
            </div>
            <div style={{ color: "#E2E8F0" }} className="text-sm">
              {analysis.reason}
            </div>
          </div>

          {analysis.metrics && (
            <div
              className="mt-3 p-3 rounded-lg space-y-2"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ color: "#93C5FD" }} className="text-xs">
                性能指标与并行优势
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <div style={{ color: "#93C5FD" }} className="text-xs">
                    支付发起时间
                  </div>
                  <div
                    style={{ color: "#E2E8F0" }}
                    className="text-sm font-mono"
                  >
                    {new Date(analysis.metrics.tPayStart).toLocaleTimeString()}
                  </div>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <div style={{ color: "#93C5FD" }} className="text-xs">
                    交易确认时间
                  </div>
                  <div
                    style={{ color: "#E2E8F0" }}
                    className="text-sm font-mono"
                  >
                    {new Date(analysis.metrics.tConfirmed).toLocaleTimeString()}
                  </div>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <div style={{ color: "#93C5FD" }} className="text-xs">
                    数据返回时间
                  </div>
                  <div
                    style={{ color: "#E2E8F0" }}
                    className="text-sm font-mono"
                  >
                    {new Date(analysis.metrics.tDataReady).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.3)",
                  }}
                >
                  <div style={{ color: "#10B981" }} className="text-xs">
                    链上确认耗时
                  </div>
                  <div
                    style={{ color: "#10B981" }}
                    className="text-lg font-semibold"
                  >
                    {analysis.metrics.confirm_ms} ms
                  </div>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                >
                  <div style={{ color: "#6366F1" }} className="text-xs">
                    数据获取耗时
                  </div>
                  <div
                    style={{ color: "#6366F1" }}
                    className="text-lg font-semibold"
                  >
                    {analysis.metrics.fetch_ms} ms
                  </div>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: "rgba(139,92,246,0.08)",
                    border: "1px solid rgba(139,92,246,0.3)",
                  }}
                >
                  <div style={{ color: "#8B5CF6" }} className="text-xs">
                    端到端总耗时（链上）
                  </div>
                  <div
                    style={{ color: "#8B5CF6" }}
                    className="text-lg font-semibold"
                  >
                    {analysis.metrics.total_ms_chain} ms
                  </div>
                </div>
              </div>
              <div className="text-xs" style={{ color: "#6B7280" }}>
                并行EVM：快且稳，确认后数据即刻可用
              </div>
              <div className="text-xs" style={{ color: "#6B7280" }}>
                钱包确认耗时：{analysis.metrics.approval_ms} ms ·
                点击至返回总耗时：
                {analysis.metrics.total_ms_click} ms
              </div>
            </div>
          )}

          {analysis.payment && (
            <div
              className="mt-3 p-3 rounded-lg"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ color: "#93C5FD" }} className="text-xs">
                支付轨迹（可验证）
              </div>
              <div
                className="mt-2 grid grid-cols-1 gap-1 text-sm"
                style={{ color: "#E2E8F0" }}
              >
                <div>
                  交易哈希：
                  <span className="font-mono">
                    {short(analysis.payment.txHash)}
                  </span>
                </div>
                <div>
                  块号：
                  <span className="font-mono">
                    {analysis.payment.blockNumber}
                  </span>
                </div>
                <div>
                  收款地址：
                  <span className="font-mono">
                    {short(analysis.payment.recipient)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
