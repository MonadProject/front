import { Clock, Flame, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { short } from "../utils";
import { useX402API } from "../hooks/useX402API";
import { X402_CONFIG } from "../config/x402";
import { useCountdown } from "../hooks/useCountdown";
import AnalysisModal from "./AnalysisModal";

export default function AuctionCard({ auction, onClick }) {
  const { timeLeft, secondsLeft, isEnded } = useCountdown(auction.endTime, {
    mode: "compact",
  });
  const { callX402API, isLoading, data: analysis } = useX402API();
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  /**
   * 获取拍卖状态徽章
   * @returns 状态徽章组件
   */
  const getStatusBadge = () => {
    if (auction.status === "active") {
      return (
        <span
          className="px-3 py-1 rounded-full text-[12px]"
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.18)",
            color: "#34D399",
          }}
        >
          ● 进行中
        </span>
      );
    } else if (auction.status === "ended") {
      return (
        <span
          className="px-3 py-1 rounded-full text-[12px]"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          已结束
        </span>
      );
    } else {
      return (
        <span
          className="px-3 py-1 rounded-full text-[12px]"
          style={{
            backgroundColor: "rgba(245, 158, 11, 0.18)",
            color: "#FBBF24",
          }}
        >
          即将开始
        </span>
      );
    }
  };

  /**
   * 判断是否紧急拍卖
   * @returns 是否紧急拍卖
   */
  const isUrgent =
    auction.status === "active" && auction.endTime - Date.now() < 60000;

  const isExpired = auction.status === "ended" || isEnded;

  const handleGetAnalysis = async (e) => {
    e.stopPropagation();
    if (isExpired) return;
    await callX402API(`/api/auction/${auction.id}/analysis`);
    setShowAnalysisModal(true);
  };

  return (
    <div
      onClick={onClick}
      className="rounded-xl p-6 cursor-pointer transition-all hover:scale-[1.02] hover:-translate-y-1"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        border: "1px solid rgba(91, 127, 255, 0.3)",
        backdropFilter: "blur(18px)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[18px]" style={{ color: "#FFFFFF" }}>
          {auction.name}
        </h3>
        {getStatusBadge()}
      </div>
      <div className="mb-4">
        <p
          className="text-[14px] mb-3"
          style={{ color: "rgba(255,255,255,0.75)" }}
        >
          {auction.description}
        </p>
        {auction.isAntiSnipe && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]"
            style={{
              backgroundColor: "rgba(91, 127, 255, 0.15)",
              color: "#5B7FFF",
            }}
          >
            <Flame className="size-4" />
            <span>防狙击保护：最后1分钟出价将延长时间</span>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between mb-4">
        <div>
          <div
            className="text-[12px] mb-1"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            当前价格
          </div>
          <div
            className="text-[24px] font-semibold"
            style={{ color: "#5B7FFF" }}
          >
            {auction.currentPrice.toFixed(6)} MON
          </div>
        </div>
      </div>
      <div
        className="mt-2 grid grid-cols-1 gap-1 text-[12px]"
        style={{ color: "rgba(255,255,255,0.75)" }}
      >
        <div>
          卖家: <span className="font-mono">{short(auction.seller)}</span>
        </div>
        <div>
          最新出价者:{" "}
          <span className="font-mono">{short(auction.highestBidder)}</span>
        </div>
      </div>
      <div
        className="flex items-center justify-between gap-2 pt-4 border-t text-[14px]"
        style={{
          borderColor: "rgba(255,255,255,0.12)",
          color: isUrgent ? "#F59E0B" : "rgba(255,255,255,0.7)",
        }}
      >
        <div className="flex items-center gap-2">
          <Clock className="size-4" />
          <span className={isUrgent ? "font-medium" : ""}>
            剩余时间: {timeLeft}
          </span>
        </div>
        <button
          onClick={handleGetAnalysis}
          disabled={isLoading || isExpired}
          className="px-3 py-1 rounded-lg flex items-center gap-1 text-[12px]"
          style={{
            background: isExpired
              ? "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)"
              : "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
            color: "white",
            opacity: isLoading || isExpired ? 0.7 : 1,
          }}
        >
          {isLoading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Sparkles className="size-3" />
          )}
          {isLoading
            ? "处理中..."
            : `AI分析 ${X402_CONFIG.PRICES.AI_ANALYSIS} MON`}
        </button>
      </div>

      <AnalysisModal
        visible={showAnalysisModal}
        analysis={analysis}
        onClose={() => setShowAnalysisModal(false)}
      />
    </div>
  );
}
