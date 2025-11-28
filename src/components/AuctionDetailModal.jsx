import { X, Clock, TrendingUp, Flame, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { useEndAuction } from "../hooks/useAuction";
import { parseEther } from "viem";
import { useCountdown } from "../hooks/useCountdown";

export default function AuctionDetailModal({ auction, onClose, onPlaceBid }) {
  const { address, isConnected } = useAccount();
  const { endAuction } = useEndAuction();
  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    enabled: !!address,
  });
  const [bidAmount, setBidAmount] = useState(
    auction.currentPrice + auction.minBidIncrement
  );
  const { timeLeft } = useCountdown(auction.endTime, { mode: "full" });
  const [error, setError] = useState("");

  /**
   * 出价
   * @param {*} increment
   * @returns
   */
  const handleBid = async (increment) => {
    if (!isConnected) {
      setError("请先连接钱包");
      return;
    }
    if (
      address &&
      String(address).toLowerCase() === String(auction.seller).toLowerCase()
    ) {
      setError("卖家不能出价");
      return;
    }
    const amount = increment ? auction.currentPrice + increment : bidAmount;
    const amountWei = parseEther(amount.toString());
    const minWei = parseEther(
      (auction.currentPrice + auction.minBidIncrement).toString()
    );
    if (amountWei < minWei) {
      setError(
        `出价必须至少为 ${auction.currentPrice + auction.minBidIncrement} MON`
      );
      return;
    }
    setError("");
    try {
      await onPlaceBid(auction.id, amount);
      await refetchBalance?.();
    } catch (e) {
      setError(e?.message || "提交出价失败");
    }
  };

  const quickBidAmounts = [
    auction.minBidIncrement,
    auction.minBidIncrement * 2,
    auction.minBidIncrement * 5,
  ];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      onClick={onClose}
    >
      <div
        className="rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: "rgba(25, 35, 60, 0.96)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 p-6 flex items-start justify-between"
          style={{
            background: "rgba(12, 20, 36, 0.55)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            color: "#FFFFFF",
          }}
        >
          <div className="flex-1">
            <h2 className="text-[32px] mb-2" style={{ color: "#fff" }}>
              {auction.name}
            </h2>
            <p className="text-[14px]" style={{ color: "#6B7280" }}>
              {auction.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="size-6" style={{ color: "rgba(255,255,255,0.7)" }} />
          </button>
        </div>
        <div className="p-6" style={{ color: "#FFFFFF" }}>
          <div
            className="flex items-center justify-center gap-3 p-4 rounded-lg mb-6"
            style={{ backgroundColor: "rgba(245, 158, 11, 0.18)" }}
          >
            <Clock className="size-5" style={{ color: "#FBBF24" }} />
            <span className="text-[18px]" style={{ color: "#FBBF24" }}>
              剩余时间: {timeLeft}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div
                className="text-[14px] mb-2"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                起拍价
              </div>
              <div className="text-[20px]">{auction.startingPrice} MON</div>
            </div>
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "rgba(91, 127, 255, 0.12)",
                border: "1px solid rgba(91,127,255,0.25)",
              }}
            >
              <div className="text-[14px] mb-2" style={{ color: "#93C5FD" }}>
                当前价格
              </div>
              <div className="text-[20px]" style={{ color: "#5B7FFF" }}>
                {auction.currentPrice} MON
              </div>
            </div>
          </div>
          {auction.isAntiSnipe && (
            <div
              className="flex items-start gap-3 p-4 rounded-lg mb-6"
              style={{
                backgroundColor: "rgba(91, 127, 255, 0.12)",
                border: "1px solid rgba(91,127,255,0.25)",
              }}
            >
              <Flame className="size-5 mt-0.5" style={{ color: "#5B7FFF" }} />
              <div>
                <div className="text-[14px] mb-1" style={{ color: "#5B7FFF" }}>
                  防狙击机制
                </div>
                <div className="text-[13px]" style={{ color: "#93C5FD" }}>
                  如果在拍卖结束前1分钟内有新的出价，拍卖时间将自动延长1分钟。这可以防止最后时刻的狙击行为，确保所有参与者都有公平的机会。
                </div>
              </div>
            </div>
          )}
          <div
            className="p-6 rounded-lg mb-6"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-5" style={{ color: "#5B7FFF" }} />
              <span className="text-[16px]">出价</span>
            </div>
            <div className="mb-4">
              <div className="text-[12px] mb-2" style={{ color: "#93C5FD" }}>
                最低加价: {auction.minBidIncrement} MON
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => {
                    setBidAmount(Number(e.target.value));
                    setError("");
                  }}
                  className="flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors"
                  style={{
                    borderColor: error ? "#EF4444" : "rgba(255,255,255,0.18)",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    color: "#FFFFFF",
                  }}
                  placeholder="输入出价金额，例如 0.05"
                  min={0}
                  step="any"
                />
                <button
                  onClick={() => handleBid()}
                  disabled={auction.status !== "active"}
                  className="px-6 py-3 rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#5B7FFF", color: "white" }}
                >
                  确认出价
                </button>
              </div>
              {isConnected && balance?.formatted && (
                <div className="mt-2 text-[12px]" style={{ color: "#93C5FD" }}>
                  可用余额: {Number(balance.formatted).toFixed(4)}{" "}
                  {balance.symbol}
                </div>
              )}
              {error && (
                <div
                  className="flex items-center gap-2 mt-2 text-[12px]"
                  style={{ color: "#EF4444" }}
                >
                  <AlertCircle className="size-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {quickBidAmounts.map((increment) => (
                <button
                  key={increment}
                  onClick={() => handleBid(increment)}
                  disabled={auction.status !== "active"}
                  className="flex-1 px-4 py-2 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: "rgba(255,255,255,0.12)",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    color: "#93C5FD",
                  }}
                >
                  +{increment} MON
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3 text-[13px]" style={{ color: "#93C5FD" }}>
            <div className="flex items-center justify-between">
              <span>拍卖ID:</span>
              <span className="font-mono">{auction.id}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>状态:</span>
              <span
                className={auction.status === "active" ? "text-[#34D399]" : ""}
              >
                {auction.status === "active"
                  ? "进行中"
                  : auction.status === "ended"
                  ? "已结束"
                  : "即将开始"}
              </span>
            </div>
          </div>
          {auction.status === "ended" && !auction.endedFlag && (
            <button
              onClick={async () => {
                try {
                  await endAuction(auction.id);
                  window.dispatchEvent(new Event("tx-confirmed"));
                  onClose();
                } catch (e) {
                  setError(e?.message || "结束拍卖失败");
                }
              }}
              className="w-full mt-2 px-4 py-2 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: "#F59E0B", color: "white" }}
            >
              拍卖结束，获取结果
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
