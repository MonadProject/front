import { Zap } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
import { useEffect } from "react";

export default function Navbar({ selectedTab, onSelectTab, isDark = false }) {
  const { address, isConnected } = useAccount();
  const { data: balance, refetch } = useBalance({
    address,
    enabled: !!address,
  });

  /**
   * 监听交易确认事件，刷新余额
   */
  useEffect(() => {
    if (!address) return;
    const handler = () => refetch?.();
    window.addEventListener("tx-confirmed", handler);
    return () => window.removeEventListener("tx-confirmed", handler);
  }, [address, refetch]);

  // 定时轮询余额，周期 3000 毫秒
  useEffect(() => {
    if (!address) return;
    const iv = setInterval(() => {
      refetch?.();
    }, 3000);
    return () => clearInterval(iv);
  }, [address, refetch]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={
        isDark
          ? {
              background: "rgba(10, 16, 30, 0.6)",
              backdropFilter: "blur(24px)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }
          : {
              background: "white",
              borderBottom: "1px solid #E5E7EB",
            }
      }
    >
      <div className="max-w-7xl mx-auto px-8 py-5">
        <div className="flex items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Zap
              className="size-7"
              style={{ color: isDark ? "#60A5FA" : "#6366F1" }}
            />
            <span
              className="text-[20px] font-bold tracking-wide"
              style={{ color: isDark ? "#FFFFFF" : "#1F2937" }}
            >
              AUCTION HOUSE
            </span>
          </div>

          {/* Center Tabs */}
          <div className="flex-1 flex items-center justify-center gap-4">
            {[
              { key: "home", label: "首页" },
              { key: "auctions", label: "拍卖市场" },
              { key: "create", label: "创建拍卖" },
              { key: "records", label: "我的记录" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => onSelectTab?.(tab.key)}
                className="px-3 py-2 rounded-md transition-all font-medium"
                style={
                  isDark
                    ? selectedTab === tab.key
                      ? { color: "#FFFFFF" }
                      : { color: "#D1D5DB" }
                    : selectedTab === tab.key
                    ? {
                        backgroundColor: "#6366F1",
                        color: "#FFFFFF",
                        border: "none",
                      }
                    : {
                        backgroundColor: "#F3F4F6",
                        color: "#6B7280",
                        border: "1px solid #E5E7EB",
                      }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* 右边用户信息 */}
          <div className="flex items-center gap-3">
            {isConnected && balance?.formatted && (
              <div
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "#F9FAFB",
                  color: isDark ? "#93C5FD" : "#374151",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.12)"
                    : "1px solid #E5E7EB",
                }}
              >
                余额: {Number(balance.formatted).toFixed(4)} {balance.symbol}
              </div>
            )}
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== "loading";
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === "authenticated");

                if (!ready) return null;

                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      className="px-4 py-2 rounded-lg transition-all font-medium hover:opacity-90"
                      style={{
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.06)"
                          : "#F3F4F6",
                        color: isDark ? "#E5E7EB" : "#374151",
                        border: isDark
                          ? "1px solid rgba(255,255,255,0.12)"
                          : "1px solid #E5E7EB",
                      }}
                    >
                      连接钱包
                    </button>
                  );
                }

                if (chain?.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      className="px-4 py-2 rounded-lg transition-all font-medium hover:opacity-90"
                      style={{
                        backgroundColor: isDark
                          ? "rgba(239, 68, 68, 0.12)"
                          : "#FEE2E2",
                        color: isDark ? "#FCA5A5" : "#B91C1C",
                        border: isDark
                          ? "1px solid rgba(239,68,68,0.35)"
                          : "1px solid #FCA5A5",
                      }}
                    >
                      网络不支持，点此切换
                    </button>
                  );
                }

                return (
                  <div className="flex items-center gap-3">
                    {/* 点击切换网络 */}
                    <button
                      onClick={openChainModal}
                      className="px-4 py-2 rounded-lg transition-all font-medium hover:opacity-90 flex items-center gap-2"
                      style={{
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.06)"
                          : "#F3F4F6",
                        color: isDark ? "#93C5FD" : "#374151",
                        border: isDark
                          ? "1px solid rgba(255,255,255,0.12)"
                          : "1px solid #E5E7EB",
                      }}
                    >
                      {chain?.hasIcon && chain?.iconUrl && (
                        <img
                          alt={chain.name ?? "chain icon"}
                          src={chain.iconUrl}
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      {chain?.name}
                    </button>

                    {/* 点击切换钱包 */}
                    <button
                      onClick={openAccountModal}
                      className="px-4 py-2 rounded-lg transition-all font-medium hover:opacity-90"
                      style={{
                        backgroundColor: isDark
                          ? "rgba(91, 127, 255, 0.18)"
                          : "#E0E7FF",
                        color: isDark ? "#E5E7EB" : "#1F2937",
                        border: isDark
                          ? "1px solid rgba(91,127,255,0.35)"
                          : "1px solid #C7D2FE",
                      }}
                    >
                      {account?.displayName}
                    </button>
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </nav>
  );
}
